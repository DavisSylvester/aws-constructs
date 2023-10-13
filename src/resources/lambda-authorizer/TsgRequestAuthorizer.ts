import { RequestAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { BaseResource } from "../base/baseResource";

import { CfnOutput } from "aws-cdk-lib";
import { createAuthorizer } from "./createAuthorizerHelpers";


export class TsgRequestAuthorizer extends BaseResource<RequestAuthorizer> {

    constructor(scope: Construct, config: AppConfig) {
        super(scope, config);
    }

    protected createResource(scope: Construct): RequestAuthorizer[] | null {
        const authorizer = createAuthorizer(scope, this.config);
        return [authorizer];
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {
        createdAssets.forEach((asset) => {
            if (asset instanceof RequestAuthorizer) {
                // Output the ARN of the authorizer
                new CfnOutput(scope, "RequestAuthorizerArn", {
                    value: `${asset.authorizationType}:${asset.authorizerArn}`
                });
            }
        });
    }
}