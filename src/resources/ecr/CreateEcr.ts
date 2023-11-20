import * as ecr from "aws-cdk-lib/aws-ecr";
import { BaseResource } from "../base/baseResource";
import { Construct } from "constructs";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { BaseResourceProps } from "../../interfaces/BaseResourceProps";

export class CreateECR extends BaseResource<ecr.Repository> {

    constructor(props: BaseResourceProps) {

        super(props.scope, props.config);

        const repos = this.createResource(props.scope);

        this.createdResources = [...repos as []];

        this.createOutput(props.scope, this.createdResources);
    }

    protected createResource(scope: Construct): ecr.Repository[] | null {

        const ecrRepo = new ecr.Repository(scope,
            `${this.config.AppName}-repository`,
            {
                repositoryName: `${this.config.AppName}-repository`,
                removalPolicy: RemovalPolicy.DESTROY,
                autoDeleteImages: true,
            });

        const rule: ecr.LifecycleRule = {
            description: 'Image Rentention',
            maxImageCount: 20
        };

        ecrRepo.addLifecycleRule(rule);

        if (ecrRepo instanceof ecr.Repository) {
            return [ecrRepo];
        }

        return null;
    }
    
    protected createOutput<Repository>(scope: Construct, createdAssets: Repository[]): void {
     
        createdAssets.forEach((x, idx) => {
            
            new CfnOutput(scope, `respository-${idx}`, {
                value: `Name: ${(x as ecr.Repository).repositoryName}\n
                    Url: ${(x as ecr.Repository).repositoryUri}`
            });
        });
    }

    


}