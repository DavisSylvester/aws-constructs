import { Duration } from "aws-cdk-lib";
import { IdentitySource, RequestAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");
import { RetentionDays } from "aws-cdk-lib/aws-logs";

const createReuqestAuhorizer = (scope: Construct, config: AppConfig) => {




};

const createAuthorizer = (scope: Construct, lambda: IFunction, config: AppConfig) => {

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

const createLambdaForAuthorizer = (scope: Construct, config: AppConfig) => {

    const props = createLambdaProps(config);

    const lambda = new NodejsFunction(
        scope,
        `${config.AppPrefix}-authorizer`,
        props
    );
 };

const createLambdaProps = (appConfig: AppConfig) => {


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
        layers: [prop.layers]
    }

    return lambdaProp;
};