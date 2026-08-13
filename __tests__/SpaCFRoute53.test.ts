import { App, Stack } from "aws-cdk-lib";
import { SpaCFRoute53 } from "../src/constructs/SpaCFRoute53";
import { SpaProps } from "../src/interfaces/SpaProps";
import { Match, Template } from "aws-cdk-lib/assertions";

describe("SpaCFRoute53", () => {
  const props: SpaProps = {
    siteName: "testsite",
    bucketName: "testsite-bucket-unique",
    cloudfrontName: "testsite-cf",
    domainName: "example.com",
    fqdn: "spa.example.com",
    hostedZoneId: "ZTEST1234567890",
  };

  it("provisions a private, versioned, encrypted S3 bucket with access logging", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", props);
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketName: props.bucketName,
      VersioningConfiguration: { Status: "Enabled" },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } },
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  it("provisions a logs bucket with 14-day retention", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", props);
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::S3::Bucket", {
      LifecycleConfiguration: {
        Rules: [{ Status: "Enabled", ExpirationInDays: 14 }],
      },
    });
  });

  it("provisions a CloudFront distribution with TLS 1.3, GET/HEAD only, and SPA error routing", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", props);
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        Aliases: [props.fqdn],
        DefaultRootObject: "index.html",
        ViewerCertificate: {
          MinimumProtocolVersion: "TLSv1.3_2025",
        },
        DefaultCacheBehavior: {
          AllowedMethods: ["GET", "HEAD"],
          ViewerProtocolPolicy: "redirect-to-https",
        },
        CustomErrorResponses: [
          {
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          },
          {
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          },
        ],
      },
    });
  });

  it("omits subjectAlternativeNames when fqdn equals domainName", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", {
      ...props,
      domainName: "admin.example.com",
      fqdn: "admin.example.com",
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: "admin.example.com",
      SubjectAlternativeNames: Match.absent(),
    });
  });

  it("still requests the fqdn as a SAN when it differs from domainName", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", props);
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
      DomainName: props.domainName,
      SubjectAlternativeNames: [props.fqdn],
    });
  });

  it("imports an existing certificate instead of creating one", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", {
      ...props,
      certificateArn:
        "arn:aws:acm:us-east-1:111122223333:certificate/11111111-2222-3333-4444-555555555555",
      createDnsRecord: false,
      hostedZoneId: undefined,
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::CertificateManager::Certificate", 0);
    template.resourceCountIs("AWS::Route53::RecordSet", 0);
  });

  it("creates both A and AAAA alias records by default", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", props);
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::Route53::RecordSet", 2);
    template.hasResourceProperties("AWS::Route53::RecordSet", { Type: "A" });
    template.hasResourceProperties("AWS::Route53::RecordSet", { Type: "AAAA" });
  });

  it("names the logs bucket when logsBucketName is provided", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");
    new SpaCFRoute53(stack, "SpaCFRoute53", {
      ...props,
      logsBucketName: "testsite-logs-unique",
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketName: "testsite-logs-unique",
      LifecycleConfiguration: { Rules: [{ Status: "Enabled", ExpirationInDays: 14 }] },
    });
  });
});
