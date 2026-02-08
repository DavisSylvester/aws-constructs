# Usage & Integration: SpaCFRoute53

This guide shows how to use the `SpaCFRoute53` construct to deploy a secure, production-grade SPA hosting stack with S3, CloudFront, and Route53.

## 1. Install Dependencies

Ensure you have the following in your `package.json`:
- `aws-cdk-lib`
- `constructs`

Install if needed (using Bun):
```sh
bun add aws-cdk-lib constructs
```

## 2. Import the Construct

```ts
import { SpaCFRoute53 } from "@sylvesterllc/aws-constructs";
import { SpaProps } from "@sylvesterllc/aws-constructs/src/interfaces/SpaProps";
```

## 3. Example Stack Usage

```ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SpaCFRoute53 } from "@sylvesterllc/aws-constructs";
import { SpaProps } from "@sylvesterllc/aws-constructs/src/interfaces/SpaProps";

export class MySpaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const spaProps: SpaProps = {
      siteName: "my-spa-app",
      bucketName: "my-spa-app-bucket-unique",
      cloudfrontName: "my-spa-app-cf",
      domainName: "example.com", // Root domain for Route53 zone lookup
      fqdn: "spa.example.com"     // Subdomain for the SPA
    };

    new SpaCFRoute53(this, "SpaCFRoute53", spaProps);
  }
}
```

## 4. Build & Deploy

```sh
cdk deploy
```

## 5. Deploy SPA Assets (Post-Build)

After building your SPA (e.g., React, Angular, Vue), upload the build output to the S3 bucket:

```sh
aws s3 sync ./dist s3://my-spa-app-bucket-unique --delete
```
- Replace `./dist` with your build output directory.
- Replace `my-spa-app-bucket-unique` with your actual bucket name.

## 6. DNS & HTTPS
- The construct creates a Route53 alias record for your `fqdn` (e.g., `spa.example.com`) pointing to CloudFront.
- Ensure your ACM certificate for the domain is issued in `us-east-1` and accessible by the stack.

## 7. Outputs
- S3 bucket (private, versioned, encrypted, access logging)
- CloudFront distribution (TLS 1.3, GET/HEAD, logging, SPA routing)
- Route53 alias record for your SPA domain
- Centralized logs bucket (14-day retention)

## 8. Security & Operations
- All public access to S3 is blocked; only CloudFront can serve assets.
- Logs are retained for 14 days for both S3 and CloudFront.
- SPA routing is handled via CloudFront custom error responses.

---

For more details, see the [plan document](./spa-cf-construct-plan.md).
