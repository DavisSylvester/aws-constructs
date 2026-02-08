# SpaCFRoute53 Construct Plan

This document outlines the plan for implementing a reusable construct named `SpaCFRoute53` to host Single Page Applications (SPAs) or static websites on Amazon S3 with a CloudFront distribution in front. The plan closely mirrors the prior `WebApplicationSpaStack` while aligning to AWS Well-Architected guidance.

## Goals
- Create a standard, secure, and efficient SPA hosting pattern.
- Accept simple inputs (`SpaProps`) while enabling optional extensions.
- Improve security and operations vs the previous stack (OAC, logging, TLS hardening).

## Props
```ts
export interface SpaProps {
  siteName: string;          // Logical app/site name used in tags and IDs
  bucketName: string;        // S3 bucket name for SPA assets (must be globally unique)
  cloudfrontName: string;    // Human-friendly name for CF distribution
  domainName: string;        // Root domain for Route53 zone lookup (e.g., example.com)
  fqdn: string;              // Fully qualified domain name to serve the site (e.g., app.example.com)
}
```

## Architecture Overview
- Amazon S3 bucket (private) stores SPA assets.
- Amazon CloudFront distribution uses S3 as origin via Origin Access Control (OAC).
- Amazon Route53 hosted zone is looked up using `domainName` and an alias record points to the CloudFront distribution when `fqdn` is provided.
- AWS Certificate Manager (ACM) certificate attached to CloudFront for HTTPS.
- Centralized logs S3 bucket captures both CloudFront and S3 access logs with 14-day retention.

## Resources & Configuration
- S3 (assets)
  - Private bucket with block public access (all settings).
  - Server-side encryption (SSE-S3 / AES256).
  - Versioning enabled.
  - Access logging to a dedicated logs bucket.
  - No ACLs; rely on bucket policy and OAC for least-privilege access.
- CloudFront
  - S3 origin integrated via OAC (modern, replaces OAI).
  - TLS policy hardened to `TLSv1.3`.
  - Allowed methods restricted to `GET` and `HEAD`.
  - Access logging enabled to logs bucket.
  - Default root object: `index.html`.
  - Custom error responses mapping `403` and `404` to `/index.html` for SPA routing.
- DNS & Certificate
  - ACM certificate attached to the distribution.
  - Hosted zone lookup via `domainName`, then Route53 alias record for `fqdn` targeting CloudFront.
- Logging & Retention
  - Dedicated logs bucket with lifecycle policy to expire objects after 14 days.
  - S3 bucket logging and CloudFront logging both target this bucket.

## Cache & Forwarding Policies
- Separate caching behavior:
  - HTML documents: short TTL to support content updates.
  - Fingerprinted static assets (e.g., `*.{hash}.js/css}`): long TTL.
- Minimize forwards to origin:
  - Avoid forwarding cookies/headers/query strings unless required.

## SPA Routing
- Configure CloudFront custom error responses:
  - `403` → `/index.html`
  - `404` → `/index.html`
- Ensures client-side routers (e.g., React Router, Angular) work with deep-links.

## Hardening & Operations
- Enforce HTTPS redirection.
 - TLS policy `TLSv1.3`.
- Restrict methods to `GET/HEAD` only.
- No WAF/WAFv2 in scope per requirements.
- Expose distribution ID and domain as outputs for invalidations and integrations.

## Outputs
- S3 bucket.
- CloudFront distribution.
- CloudFront domain name.
- CloudFront distribution ID.

## Testing Checklist
- Bucket is private with all public access blocked.
- SSE enabled, versioning enabled.
- S3 access logging enabled to logs bucket.
- Logs bucket has lifecycle to expire logs at 14 days.
- CloudFront uses OAC to access bucket.
 - CloudFront logging enabled; TLS policy `TLSv1.3`.
- Allowed methods are `GET/HEAD` only.
- SPA routing: 403/404 mapped to `/index.html`.
- DNS alias resolves to CloudFront when `fqdn` provided.

## Similarity to Prior Implementation
- Mirrors `WebApplicationSpaStack` semantics (S3 + CloudFront + DNS + ACM).
- Improves security posture by:
  - Using OAC instead of OAI.
  - Removing public bucket policies and ACLs.
  - Adding centralized logging with defined retention.
  - Hardening TLS and HTTP methods.

## Not Included
- WAF/WAFv2 (explicitly excluded).

## Asset Deployment

**Note:** This construct does not use `aws-s3-deployment` for asset publishing. Instead, deploy your SPA build output using the AWS CLI after your build completes. Example:

```sh
aws s3 sync ./dist s3://<your-bucket-name> --delete
```

Replace `./dist` with your SPA build output directory and `<your-bucket-name>` with the bucket name you provided in `SpaProps`.

## Next Steps
- Implement `SpaCFRoute53` construct with `SpaProps`.
- Export from `src/constructs/index.ts`.
- Add unit tests and example usage.
- Tag resources consistently (`App`, `ResourcePrefix`).