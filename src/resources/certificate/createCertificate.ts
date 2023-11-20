import { RemovalPolicy } from "aws-cdk-lib";
import { Certificate, CertificateValidation, DnsValidatedCertificate, ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";


export class CreateCertificate {

    public certificate: ICertificate;

    constructor(scope: Construct, props: MicroserviceProps, hostedZone: IHostedZone) {

        this.certificate = this.generateCertificate(scope, props, hostedZone);

        this.certificate.applyRemovalPolicy(RemovalPolicy.DESTROY);
        
    }

    generateCertificate(scope: Construct, props: MicroserviceProps, hostedZone: IHostedZone) {

        // const cert = new DnsValidatedCertificate(scope, `${props.DNS.ZoneNameWithoutPeriod}-spa-app-certificate`, {
        //     domainName: `${props.API.DomainPrefix}.${props.DNS.ZoneName}`,
        //     hostedZone,
        //     region: props.GLOBALS.region || "us-east-1"
        //   }); 

          const appType = "spa-app";

          const cert = new Certificate(scope, `${props.DNS?.ZoneNameWithoutPeriod}-${appType}-certificate`, {
            domainName: `${props.API.DomainPrefix}.${props.DNS?.ZoneName}`,
            // subjectAlternativeNames: [`${props.API.DomainPrefix}.${props.DNS?.ZoneName}`],
            validation: CertificateValidation.fromDnsMultiZone({                
                    [`${props.API.DomainPrefix}.${props.DNS?.ZoneName}`] : hostedZone ,                
            }),
          });

          return cert;
    }
}