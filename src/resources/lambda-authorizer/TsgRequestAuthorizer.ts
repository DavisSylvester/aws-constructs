import { RequestAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { BaseResource } from "../base/baseResource";

import { CfnOutput } from "aws-cdk-lib";
import { createAuthorizer } from "./createAuthorizerHelpers";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { ITableV2 } from "aws-cdk-lib/aws-dynamodb";


export class TsgRequestAuthorizer extends BaseResource<RequestAuthorizer> {

    get RequestAuthorizer() {
        return this.createdResources[0];
    }

    constructor(scope: Construct, 
        config: AppConfig, 
        private layers?: LayerVersion[], 
        private tables?: ITableV2[]) {
        super(scope, config);

        this.createdResources = this.createResource(scope)!;        
    }

    protected createResource(scope: Construct): RequestAuthorizer[] | null {
        
        const authorizer = createAuthorizer(scope, this.config, this.layers, this.tables);
        
        return [authorizer];
        
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {
        createdAssets?.forEach((asset) => {
            if (asset instanceof RequestAuthorizer) {
                // Output the ARN of the authorizer
                new CfnOutput(scope, "RequestAuthorizerArn", {
                    value: `${asset.authorizationType}:${asset.authorizerArn}`
                });
            }
        });
    }
}