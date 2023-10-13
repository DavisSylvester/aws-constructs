import { CfnOutput, Duration } from "aws-cdk-lib";
import { IdentitySource, TokenAuthorizer, TokenAuthorizerProps } from "aws-cdk-lib/aws-apigateway";
import { ManagedPolicy, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from 'path';
import { AppConfig } from "../../config/AppConfig";

import { TsgLambdaProp } from "../../config/types";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";
import { BaseResource } from "../base/baseResource";
import { CreateLambda } from "../lambda/createLambda";

export class TsgJwtTokenAuthorizer extends BaseResource<TokenAuthorizer> {

    get JwtAuthorizer() {
        return this.createdResources[0];
    }

    constructor(scope: Construct, props: AppConfig, protected authProps: TsgLambdaProp) {

        super(scope, props);

        this.createdResources = this.createResource(scope)!;

        if (this.createdResources) {
            this.createOutput<TokenAuthorizer>(scope, this.createdResources);
        }

    }

    protected createResource(scope: Construct): TokenAuthorizer[] | null {
        return [this.createLambdaAuthorizer(scope, this.authProps)];
    }

    private createLambdaAuthorizer(scope: Construct, lambdaConfig: TsgLambdaProp) {
        //console.log("ENTER createLambdaAuthorizer");

        const authorizerProps = this.createLambdaFunctionProps(lambdaConfig!);

        const lambdaId = CreateLambda.getIdForLambda(lambdaConfig, this.config);
        const lambda = new NodejsFunction(scope, lambdaId, authorizerProps);

        lambda.grantInvoke(new ServicePrincipal('apigateway.amazonaws.com'));

        if (lambdaConfig?.managedPolicies && lambdaConfig.managedPolicies.length > 0) {
            this.assignManagedPolicies(lambda, lambdaConfig.managedPolicies);
        }

        const props: TokenAuthorizerProps = {
            handler: lambda,
            authorizerName: lambdaConfig.name,
            resultsCacheTtl: Duration.seconds(0), 
            identitySource: IdentitySource.header('Authorization'),
            
        };

        const lambdaAuthorizer = new TokenAuthorizer(scope, `${lambdaConfig.name}-authorizer`, props);

        return lambdaAuthorizer;
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {

        const entity = createdAssets[0];

        // new CfnOutput(scope, `authorizer`, {
        //     value: (entity as TokenAuthorizer).authorizerArn
        // });

    }

    private createLambdaFunctionProps(prop: TsgLambdaProp) {       

        const lambdaProp: NodejsFunctionProps = {
            entry: path.join(prop.codePath),
            functionName: prop.name,
            handler: prop.handler,
            runtime: prop.runtime || this.config.GLOBALS.stackRuntime,
            timeout: prop.duration || Duration.minutes(2),
            memorySize: prop.memory || 512,
            environment: {
                "VERBOSE_LOGGING": "true",                
                ...prop.environment
            },
            bundling: {
                minify: false,
                target: 'es2020',
                sourceMap: true,
                sourceMapMode: SourceMapMode.INLINE,
                environment: prop.environment || prop.environment,
            },
        }
        return lambdaProp;
    };

    private assignManagedPolicies(lambda: NodejsFunction, managedPolicyNames: string[]) {

        managedPolicyNames.forEach((managedPolicyName: string) => {

            let policy = ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName);

            lambda.role?.addManagedPolicy(policy);
        });

    }

}