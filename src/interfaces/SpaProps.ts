export interface SpaProps {
  siteName: string; // Logical app/site name used in tags and IDs
  bucketName: string; // S3 bucket name for SPA assets (must be globally unique)
  cloudfrontName: string; // Human-friendly name for CF distribution
  domainName: string; // Root domain for Route53 zone lookup (e.g., example.com)
  fqdn: string; // Fully qualified domain name to serve the site (e.g., app.example.com)
  hostedZoneId?: string; // Optional: provide Hosted Zone ID to import zone directly
  certificateArn?: string; // Optional: import this cert instead of creating one (must be us-east-1)
  createDnsRecord?: boolean; // Optional: default true; false skips the Route53 alias records
  logsBucketName?: string; // Optional: physical name for the access/CloudFront logs bucket
}
