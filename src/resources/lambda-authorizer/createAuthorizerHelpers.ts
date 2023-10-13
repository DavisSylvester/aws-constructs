import { Duration } from "aws-cdk-lib";
import { IdentitySource, RequestAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { IFunction, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");
import { RetentionDays } from "aws-cdk-lib/aws-logs";

export const createAuthorizer = (scope: Construct, config: AppConfig, layers?: LayerVersion[]) => {

    const lambda = createLambdaForAuthorizer(scope, config);

    const lambdaAuthroizer = new RequestAuthorizer(
        scope,
        `lambdaAuthorizer`,
        {
            handler: lambda,
            identitySources: [IdentitySource.header(config.RESOURCES.AUTHORIZER?.headerName!)],
            authorizerName: `${config.AppPrefix}-authorizer`,
            resultsCacheTtl: Duration.seconds(0),
        }
    );

    return lambdaAuthroizer;
};

const createLambdaForAuthorizer = (scope: Construct, config: AppConfig, layers?: LayerVersion[]) => {

    const props = createLambdaProps(config, layers);

    const lambda = new NodejsFunction(
        scope,
        `${config.AppPrefix}-authorizer`,
        props
    );

    return lambda;
 };

const createLambdaProps = (appConfig: AppConfig, layers?: LayerVersion[]) => {


    const prop = appConfig.RESOURCES.AUTHORIZER!;

    const lambdaProp: NodejsFunctionProps = {
        entry: path.join(prop.codePath),
        functionName: `${appConfig.AppPrefix}-${prop.name}`,
        handler: prop.handler,
        logRetention: (!prop.logDuration) ? RetentionDays.FIVE_DAYS : RetentionDays.ONE_MONTH,
        runtime: prop.runtime || appConfig.GLOBALS.stackRuntime,
        timeout: prop.duration || Duration.minutes(2),
        memorySize: prop.memory || 512,
        environment: {
            "VERBOSE_LOGGING": "true",
            ...prop.environment
        },
        bundling: {
            minify: false,
            target: 'esNext',
            sourceMap: true,
            sourceMapMode: SourceMapMode.EXTERNAL,
            environment: prop.environment || prop.environment,
        },
        layers
    }

    return lambdaProp;
};