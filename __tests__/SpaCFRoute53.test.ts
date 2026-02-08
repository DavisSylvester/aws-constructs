import { App, Stack } from "aws-cdk-lib";
import { SpaCFRoute53 } from "../src/constructs/SpaCFRoute53";
import { SpaProps } from "../src/interfaces/SpaProps";
import { Template } from "aws-cdk-lib/assertions";

describe("SpaCFRoute53", () => {
  const props: SpaProps = {
    siteName: "testsite",
    bucketName: "testsite-bucket-unique",
    cloudfrontName: "testsite-cf",
    domainName: "example.com",
    fqdn: "spa.example.com",
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
});
