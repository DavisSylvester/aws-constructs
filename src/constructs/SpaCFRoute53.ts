import { Construct } from "constructs";
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
  BucketAccessControl,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import {
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
  PriceClass,
  ResponseHeadersPolicy,
  CfnDistribution,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate, CertificateValidation, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  HostedZone,
  IHostedZone,
  ARecord,
  AaaaRecord,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { SpaProps } from "../interfaces/SpaProps";
import { Tags, RemovalPolicy, Duration, CfnOutput } from "aws-cdk-lib";

export class SpaCFRoute53 extends Construct {
  public readonly bucket: Bucket;
  public readonly distribution: Distribution;
  public readonly distributionDomainName: string;
  public readonly distributionId: string;
  public readonly logsBucket: Bucket;

  constructor(scope: Construct, id: string, props: SpaProps) {
    super(scope, id);

    // Build a safe key from domain for export names (replace dots)
    const domainKey = (props.fqdn ?? props.domainName).split(".").join("-");

    // Logs bucket with 14-day retention
    this.logsBucket = new Bucket(
      this,
      `${props.domainName?.toLowerCase()}-spa-bucket-log`,
      {
        ...(props.logsBucketName ? { bucketName: props.logsBucketName } : {}),
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        lifecycleRules: [{ expiration: Duration.days(14) }],
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: false,
        // CloudFront standard logs require ACLs; enable them and grant log delivery write
        objectOwnership: ObjectOwnership.OBJECT_WRITER,
        accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
      },
    );

    // Main SPA bucket
    this.bucket = new Bucket(
      this,
      `${props.domainName?.toLowerCase()}-spa-bucket`,
      {
        bucketName: props.bucketName,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        encryption: BucketEncryption.S3_MANAGED,
        versioned: true,
        serverAccessLogsBucket: this.logsBucket,
        serverAccessLogsPrefix: "spa/",
      },
    );

    // Whether the Route53 zone is needed at all. A caller that imports a cert AND
    // skips the alias records has no use for a zone — and in that configuration a
    // fromLookup() would fail, since the whole point is DNS held outside Route53.
    const createDnsRecord: boolean = props.createDnsRecord ?? true;
    const needsHostedZone: boolean = createDnsRecord || props.certificateArn === undefined;

    let hostedZone: IHostedZone | undefined;
    if (needsHostedZone) {
      hostedZone = props.hostedZoneId
        ? HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
            hostedZoneId: props.hostedZoneId,
            zoneName: props.domainName,
          })
        : HostedZone.fromLookup(this, "HostedZone", {
            domainName: props.domainName,
          });
    }

    // ACM certificate (must be in us-east-1 for CloudFront).
    let certificate: ICertificate;
    if (props.certificateArn) {
      certificate = Certificate.fromCertificateArn(this, "SpaCert", props.certificateArn);
    } else {
      if (!hostedZone) {
        throw new Error(
          "SpaCFRoute53: a hosted zone is required to create a DNS-validated certificate. Pass certificateArn to import one instead.",
        );
      }
      // A site on a delegated subdomain zone has fqdn === domainName. Passing the
      // same name as both DomainName and a SAN yields duplicate
      // DomainValidationOptions entries, which CloudFormation rejects.
      const created = new Certificate(this, "SpaCert", {
        domainName: props.domainName,
        ...(props.fqdn === props.domainName
          ? {}
          : { subjectAlternativeNames: [props.fqdn] }),
        validation: CertificateValidation.fromDns(hostedZone),
      });
      // Tag for visibility in console: "Certificate name"
      Tags.of(created).add("Name", `${props.siteName}-cert-cf`);
      certificate = created;
    }

    // CloudFront distribution
    this.distribution = new Distribution(this, "SpaDistribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(this.bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: undefined, // Custom cache policy can be added
        compress: true,
        responseHeadersPolicy:
          ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
      },
      defaultRootObject: "index.html",
      domainNames: [props.fqdn],
      certificate,
      priceClass: PriceClass.PRICE_CLASS_100,
      enableLogging: true,
      logBucket: this.logsBucket,
      logFilePrefix: "cloudfront/",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
      ],
    });

    // Force TLS 1.3 in the synthesized template to satisfy tests
    const cfnDist = this.distribution.node.defaultChild as CfnDistribution;
    cfnDist.addPropertyOverride(
      "DistributionConfig.ViewerCertificate.MinimumProtocolVersion",
      "TLSv1.3_2025",
    );

    this.distributionDomainName = this.distribution.distributionDomainName;
    this.distributionId = this.distribution.distributionId;

    // Route53 alias records. AAAA as well as A: CloudFront is dual-stack, so an
    // A-only zone is unreachable from IPv6-only clients.
    if (createDnsRecord) {
      if (!hostedZone) {
        throw new Error(
          "SpaCFRoute53: createDnsRecord requires a hosted zone. Provide hostedZoneId, or pass createDnsRecord: false.",
        );
      }
      const aliasTarget = RecordTarget.fromAlias(new CloudFrontTarget(this.distribution));
      new ARecord(this, "SpaAliasRecord", {
        zone: hostedZone,
        recordName: props.fqdn,
        target: aliasTarget,
      });
      new AaaaRecord(this, "SpaAliasRecordAaaa", {
        zone: hostedZone,
        recordName: props.fqdn,
        target: aliasTarget,
      });
    }

    // Tagging
    Tags.of(this.bucket).add("App", props.siteName);
    Tags.of(this.bucket).add("ResourcePrefix", props.siteName);
    Tags.of(this.distribution).add("App", props.siteName);
    Tags.of(this.distribution).add("ResourcePrefix", props.siteName);
    Tags.of(this.logsBucket).add("App", props.siteName);
    Tags.of(this.logsBucket).add("ResourcePrefix", props.siteName);

    // CloudFormation outputs for created resources
    new CfnOutput(this, "SpaBucketName", { value: this.bucket.bucketName });
    new CfnOutput(this, "SpaLogsBucketName", { value: this.logsBucket.bucketName });
    new CfnOutput(this, "SpaCertificateArn", { value: certificate.certificateArn });
    new CfnOutput(this, "SpaDistributionId", { value: this.distribution.distributionId });
    new CfnOutput(this, "SpaDistributionDomainName", { value: this.distribution.distributionDomainName });
    if (createDnsRecord) {
      new CfnOutput(this, "SpaAliasRecordName", { value: props.fqdn });
    }
  }
}
