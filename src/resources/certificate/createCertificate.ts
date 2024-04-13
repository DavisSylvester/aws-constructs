import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate, CertificateValidation, DnsValidatedCertificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, IHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";
import { environmentSuffixForDomain } from "../../helpers/util-helper";
import { Environment } from "../../config/Environments";


export class CreateCertificate {

  public certificate: ICertificate;

  constructor(scope: Construct, props: MicroserviceProps, hostedZone: IHostedZone, env: Environment = "prod") {

    // this.certificate = this.generateCertificate(scope, props, hostedZone);

    this.certificate = this.generateApiCertificate(scope, props, hostedZone, env);

    this.certificate.applyRemovalPolicy(RemovalPolicy.DESTROY);

  }

  generateCertificate(scope: Construct, props: MicroserviceProps, hostedZone: IHostedZone) {

    // const cert = new DnsValidatedCertificate(scope, `${props.DNS.ZoneNameWithoutPeriod}-spa-app-certificate`, {
    //     domainName: `${props.API.DomainPrefix}.${props.DNS.ZoneName}`,
    //     hostedZone,
    //     region: props.GLOBALS.region || "us-east-1"
    //   }); 

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

  generateApiCertificate(scope: Construct, props: MicroserviceProps, hostedZone: IHostedZone, env: Environment) {

    const domainName = `${props.API.DomainPrefix}${environmentSuffixForDomain(env)}.${props.DNS?.ZoneName}`;

    console.log('domainName: ', domainName);


    //  api.c1-.dev-certificate
    const cert = new Certificate(scope, `${props.API.DomainPrefix}-${environmentSuffixForDomain(env)}-certificate`, {


      domainName,
      validation: CertificateValidation.fromDnsMultiZone({
        [domainName]: hostedZone
      })
    });

    return cert;
  }
}