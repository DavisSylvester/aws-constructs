// import { CfnOutput } from "aws-cdk-lib";
// import { HostedZoneProps, IHostedZone, IPublicHostedZone, PublicHostedZone } from "aws-cdk-lib/aws-route53";
// import { Construct } from "constructs";
// import { BaseResource } from "../base/BaseResource";

// export class CreateHostedZone extends BaseResource  {
    
//     public createdPublicZones: IPublicHostedZone[] = [];
    
//     constructor(scope: Construct) {
//         super(scope);

//         this.createZone();
        
//     }

//     public createZone() {
//         const props: HostedZoneProps = {
//             zoneName: this.appConfig.DNS.ZoneName
//         };
    
//         let zone: IPublicHostedZone;

//         if (!this.appConfig.DNS.ZoneExist) {
//             zone = new PublicHostedZone(this.scope, `${this.appConfig.DNS.ZoneNameWithoutPeriod}-hosted-zone`, props);
//         } else {
//             if (!this.appConfig.DNS.ZoneName || !this.appConfig.DNS.ZoneId) {
//                 throw new Error("You must provide a Zone Name and Zone Id");                
//             }
//             zone = PublicHostedZone.fromHostedZoneAttributes(this.scope, `${this.appConfig.DNS.ZoneNameWithoutPeriod}-hosted-zone`, {
//                 zoneName: this.appConfig.DNS.ZoneName,
//                 hostedZoneId: this.appConfig.DNS.ZoneId
//             });
//         }

//         this.createdPublicZones.push(zone);
    
//         this.createOutput(this.scope, this.createdPublicZones);
//     }

//     protected createOutput<HostedZone>(scope: Construct, createdAssets: HostedZone[]): void {
        
//         let nameServers = '';
        
//         this.createdPublicZones.forEach((zone, index) => {
//             console.log('Name Servers:', zone.hostedZoneNameServers);    
            
//             zone.hostedZoneNameServers?.forEach((server, idx) => { 
//                 console.log(nameServers);
//                 nameServers = `${nameServers} - ${idx}: ${server}`;
//             }, '');
    
//             new CfnOutput(scope, `zone-output-${index}`, {
//                 value: zone.hostedZoneId,
//                 exportName: 'hosted-zone-id'
//             });
    
//             nameServers = '';
//         });
//     }

// }