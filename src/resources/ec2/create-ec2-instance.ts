import { Instance, InstanceType, InstanceClass, InstanceSize, MachineImage, Vpc, CfnKeyPair } from "aws-cdk-lib/aws-ec2";
import { BaseResource } from "../base/baseResource";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { CfnOutput } from "aws-cdk-lib";

export class Ec2Instance extends BaseResource<Instance> {

    constructor(scope: Construct, config: AppConfig) {
        super(scope, config);

        const createdAssets = this.createResource(scope);

        this.createOutput<Instance>(scope, createdAssets!);
    }

    protected createResource(scope: Construct): Instance[] | null {

        const keyPair = new CfnKeyPair(scope, 'my-key-pair', {
            keyName: 'davis-dsylv-amazon-com',
            publicKeyMaterial: process.env.KEY_PAIR
        });

        const server = new Instance(scope, `my-ec2`, {
            vpc: Vpc.fromLookup(scope, 'VPC', {
                vpcId: process.env.VPC_PRIMARY_ID,
                isDefault: true
            }),
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL),
            machineImage: MachineImage.genericLinux({
                'us-east-1': 'ami-010e83f579f15bba0'
            }),
            keyName: keyPair.keyName

        });

        return [server];
    }
    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {

        createdAssets.forEach((asset, index) => {
            new CfnOutput(scope, `my-ec2-instance-${index}`, {
                value: `Server Name: ${(asset as Instance).instancePrivateDnsName} \n 
                Private: ${(asset as Instance).instancePrivateIp} \n 
                Public: ${(asset as Instance).instancePublicIp}`
            });
        });


    }


}