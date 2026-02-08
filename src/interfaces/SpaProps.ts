export interface SpaProps {
  siteName: string; // Logical app/site name used in tags and IDs
  bucketName: string; // S3 bucket name for SPA assets (must be globally unique)
  cloudfrontName: string; // Human-friendly name for CF distribution
  domainName: string; // Root domain for Route53 zone lookup (e.g., example.com)
  fqdn: string; // Fully qualified domain name to serve the site (e.g., app.example.com)
}
