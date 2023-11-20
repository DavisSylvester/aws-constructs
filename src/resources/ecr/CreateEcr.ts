import { LifecycleRule, Repository } from "aws-cdk-lib/aws-ecr";
import { BaseResource } from "../base/baseResource";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";

export class CreateECR extends BaseResource<Repository> {

    constructor(protected scope: Construct, protected config: AppConfig) {

        super(scope, config);

        const repos = this.createResource(scope);

        this.createdResources = [...repos as []];

        this.createOutput(scope, this.createdResources);
    }

    protected createResource(scope: Construct): Repository[] | null {

        const ecrRepo = new Repository(scope,
            `${this.config.AppName}-repository`,
            {
                repositoryName: `${this.config.AppName}-repository`,
                removalPolicy: RemovalPolicy.DESTROY,
                autoDeleteImages: true,
            });

        const rule: LifecycleRule = {
            description: 'Image Rentention',
            maxImageCount: 20
        };

        ecrRepo.addLifecycleRule(rule);

        if (ecrRepo instanceof Repository) {
            return [ecrRepo];
        }

        return null;
    }
    
    protected createOutput<Repository>(scope: Construct, createdAssets: Repository[]): void {
     
        createdAssets.forEach((x, idx) => {

            new CfnOutput(scope, `respository-${idx}`, {
                value: `Name: ${x}} \n Url: ${(x as Repository).repositoryUri}`
            });
        });
    }

    isArrayOfType(resource: T): 


}