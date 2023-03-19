// import { CfnOutput, Token } from "aws-cdk-lib";
// import { HostedZoneProps, PublicHostedZone, ZoneDelegationRecord } from "aws-cdk-lib/aws-route53";
// import { Construct } from "constructs";
// import { MicroserviceProps } from "../../interfaces/MicroserviceProps";


// export const createZones = (scope: Construct, appConfig: MicroserviceProps) => {

//     const createdPublicZones: PublicHostedZone[] = [];

//     const props: HostedZoneProps = {
//         zoneName: appConfig.DNS.ZoneName
//     };

//     const createdZone = new PublicHostedZone(scope, `${appConfig.DNS.ZoneNameWithoutPeriod}-hosted-zone`, props);

//     createdPublicZones.push(createdZone);

//     zoneOutput(scope, createdPublicZones);
// };

// const zoneOutput = (scope: Construct, publicZones: PublicHostedZone[]) => {

    
//     let nameServers = '';
//     publicZones.forEach((zone, index) => {
//         console.log('Name Servers:', zone.hostedZoneNameServers);    
//         zone.hostedZoneNameServers?.forEach((server, idx) => { 
//             console.log(nameServers);
//             nameServers = `${nameServers} - ${idx}: ${server}`;
//         }, '');

//         new CfnOutput(scope, `zone-output-${index}`, {
//             value: zone.hostedZoneId,
//             exportName: 'hosted-zone-id'
//         });

//         nameServers = '';
//     });

// };