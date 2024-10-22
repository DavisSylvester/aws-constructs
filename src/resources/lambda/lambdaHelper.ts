import { IRole } from "aws-cdk-lib/aws-iam";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { TsgLambdaProp } from "../../config/types";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { TsgLambdaProps } from "../../config/types/TsgLambdaProps";
import { CreateLambdaFunctionInput } from "../../interfaces/CreateLambdaFunctionInput";
import * as path from "node:path";
import { AppConfig } from "../../config/AppConfig";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration } from "aws-cdk-lib";
import { LogDuration } from "../../config/types/LogDuration";


export class LambdaHelper {

    public static createLambdaFunctions(scope: Construct,
        config: AppConfig,
        lambdaConfigs: TsgLambdaProp | TsgLambdaProp[],
        role?: IRole,
        layers?: LayerVersion[]) {

        const isArrayOfLambdaProps = Array.isArray(lambdaConfigs);

        const appConfig = config;

        if (isArrayOfLambdaProps) {
            const createdLambdas = lambdaConfigs.map((config: TsgLambdaProp) => {

                return LambdaHelper.createLambda(config, role, layers, appConfig, scope);
            });
            return createdLambdas || [];
        } else {
            return LambdaHelper.createLambda(lambdaConfigs as TsgLambdaProp, role, layers, config, scope);
        }
    }

    private static createLambda(config: TsgLambdaProp,
        role: IRole | undefined,
        layers: LayerVersion[] | undefined,
        appConfig: AppConfig,
        scope: Construct) {

        let lambdaProps = this.createLambdaProps(config, role, layers, {
            appConfig: appConfig,
            role,
            layers,
            scope
        });

        const lambdaId = this.getIdForLambda(config, appConfig);
        let fctn = new NodejsFunction(scope, lambdaId, lambdaProps);

        if (lambdaId !== fctn.node.id) {
            console.error(`can not find Lambda for : ${fctn.node.id}`);
        }

        return fctn;
    }

    private static createLambdaProps(prop: TsgLambdaProp,
        role?: IRole,
        layers?: LayerVersion[],
        props?: TsgLambdaProps) {

        return this.createLambdaFunctionProps({
            prop,
            role,
            layers,
            props
        });
    }

    private static createLambdaFunctionProps(props: CreateLambdaFunctionInput) {
        const { prop, role, layers } = props;

        const config = props.props?.appConfig;

        const lambdaProp: NodejsFunctionProps = {
            entry: path.join(prop.codePath),
            functionName: `${config?.AppPrefix}-${prop.name}`,
            handler: prop.handler,
            logRetention: (!prop.logDuration) ? RetentionDays.FIVE_DAYS :
                LambdaHelper.getDayToSaveLogs(prop.logDuration),
            runtime: prop.runtime || config?.GLOBALS.stackRuntime,
            timeout: prop.duration || Duration.minutes(2),
            memorySize: prop.memory || 512,
            environment: {
                "VERBOSE_LOGGING": "true",
                ...prop.environment
            },
            bundling: {
                minify: true,
                target: "ESNext",
                sourceMap: true,
                sourceMapMode: SourceMapMode.EXTERNAL,
                environment: prop.environment || prop.environment,
            },
            role,
            layers

        }
        return lambdaProp;
    };

    public static getDayToSaveLogs(saveLogDuration: LogDuration): RetentionDays {

        switch (saveLogDuration) {
            case LogDuration.ONE_DAY:
                return RetentionDays.ONE_DAY;

            case LogDuration.ONE_WEEK:
                return RetentionDays.ONE_WEEK;

            case LogDuration.ONE_MONTH:
                return RetentionDays.ONE_MONTH;

            case LogDuration.ONE_YEAR:
                return RetentionDays.ONE_YEAR;

            case LogDuration.FIVE_YEARS:
                return RetentionDays.FIVE_YEARS;

            case LogDuration.FOREVER:
                return RetentionDays.INFINITE;
            default:
                return RetentionDays.FIVE_DAYS;
        }
    }

    public static getIdForLambda(lambdaProp: TsgLambdaProp, appConfig: AppConfig) {
        return `${appConfig.AppPrefix}-${lambdaProp.name}`.toLowerCase();
    }
}