import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate, CertificateValidation, DnsValidatedCertificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";
import { environmentSuffixForDomain } from "../../helpers/util-helper";
import { Environment } from "../../config/Environments";
import { env } from "process";


export class CreateCertificate {

  public certificate: ICertificate;

  constructor(scope: Construct, props: MicroserviceProps, hostedZone: IHostedZone, env: string) {

    // this.certificate = this.generateCertificate(scope, props, hostedZone);

    this.certificate = this.generateApiCertificate(scope, props, env);

    this.certificate.applyRemovalPolicy(RemovalPolicy.DESTROY);

  }

  generateCertificate(scope: Construct, props: MicroserviceProps, hostedZone: IHostedZone, env: string) {

    const devHostedZone = HostedZone.fromHostedZoneId(scope, `api.c1.dev.convergeone.io-hosted-zone`,
      'Z0508834Q8E4TWFVG990');

    const cert = new Certificate(scope, `api-c1-dev-api-certificate`, {
      domainName: `c1.api.dev.convergeone.io`,
      validation: CertificateValidation.fromDnsMultiZone({
        [`dev.convergeone.io`]: devHostedZone
      })
    });
    return cert;
  }

  generateApiCertificate(scope: Construct, props: MicroserviceProps, env: string) {

    const hostedZone = HostedZone.fromHostedZoneId(scope, `${props.API.DomainPrefix}-${env}-${props.DNS?.ZoneName}-hosted-zone`,
      props.DNS?.ZoneId!);

    const domainName = `${props.API.DomainPrefix}.${env}.${props.DNS?.ZoneName}`;

    const cert = new Certificate(scope, `${props.API.DomainPrefix}-${env}-${props.DNS?.ZoneName}-certificate`, {
      certificateName: `${domainName}-certificate`,
      domainName: domainName,
      validation: CertificateValidation.fromDnsMultiZone({
        [`${env}.${props.DNS?.ZoneName}`]: hostedZone

      })
    });

    return cert;
  }
}