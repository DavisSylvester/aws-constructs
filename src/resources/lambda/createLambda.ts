import { CfnOutput, Duration } from "aws-cdk-lib";
import { TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { Alarm, ComparisonOperator, IAlarmAction } from "aws-cdk-lib/aws-cloudwatch";
import { IRole, ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from 'path';
import { AppConfig } from "../../config/AppConfig";
import { TsgLambdaProp } from "../../config/types";

import { TsgLambdaProps } from "../../config/types/TsgLambdaProps";
import { CreateLambdaFunctionInput } from "../../interfaces/CreateLambdaFunctionInput";
import { BaseResource } from "../base/baseResource";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { LambdaHelper } from "./lambdaHelper";
import { getUUID } from "../../helpers/util-helper";


export class CreateLambda extends BaseResource<NodejsFunction> {

    public Lambdas: NodejsFunction[] = [];
    public LambdaRecords: Record<string, NodejsFunction> = {};

    constructor(scope: Construct, config: AppConfig, private layers?: LayerVersion[]) {
        super(scope, config);

        const resources = this.createResource(scope);

        this.createdResources = [...resources];

        this.Lambdas = [...resources];

        this.createAlarmsForLambdas(this.Lambdas);

        this.LambdaRecords = this.createRecordForLambda(this.Lambdas);

        this.createOutput(scope, resources);
    }

    protected createResource(scope: Construct): NodejsFunction[] {

        const result = this.createLambdas(this.config);

        return result;
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {
        createdAssets.forEach((x, idx) => {

            new CfnOutput(scope, `lambda-${idx}`, {
                // @ts-ignore
                value: x.functionName
            });
        });
    }

    private createLambdas(config: AppConfig): NodejsFunction[] {

        const createdLambdas: NodejsFunction[] = this.createLambdaFunctions(this.scope, undefined, this.layers);

        return createdLambdas;
    }

    private createLambdaFunctions(scope: Construct, role?: IRole, layers?: LayerVersion[]) {

        const createdLambdas = this.config.RESOURCES.LAMBDA.map((config: TsgLambdaProp) => {

            let lambdaProps = this.createLambdaProps(config, role, layers);

            const lambdaId = CreateLambda.getIdForLambda(config, this.config);
            let fctn = new NodejsFunction(scope, lambdaId, lambdaProps);

            return fctn;
        });

        return createdLambdas || [];
    }

    private createLambdaProps(prop: TsgLambdaProp, role?: IRole, layers?: LayerVersion[], props?: TsgLambdaProps) {

        return this.createLambdaFunctionProps({
            prop,
            role,
            layers,
            props
        });
    }

    private createLambdaFunctionProps(props: CreateLambdaFunctionInput) {
        const { prop, role, layers } = props;

        const lambdaProp: NodejsFunctionProps = {
            entry: path.join(prop.codePath),
            functionName: `${this.config.AppPrefix}-${prop.name}`,
            handler: prop.handler,
            logRetention: (!prop.logDuration) ? RetentionDays.FIVE_DAYS : LambdaHelper.getDayToSaveLogs(prop.logDuration),
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
                sourceMapMode: SourceMapMode.EXTERNAL,
                environment: prop.environment || prop.environment,
            },
            role,
            layers

        }

        return lambdaProp;
    };

    private createAlarmsForLambdas(lambdas: NodejsFunction[]) {

        const lambdaRecords = this.createRecordForLambda(lambdas);

        // console.log('Lambda Records:', lambdaRecords);
        // const lambdaNames = Object.keys(lambdaRecords);
        // console.log('lambda Names from Records', lambdaNames);

        lambdas.forEach((lambda, idx) => {

            const errorMetric = lambda.metricErrors({
                period: Duration.minutes(3),

            });

            const durationMetric = lambda.metricDuration({
                period: Duration.minutes(3),
            });

            const invocationMetric = lambda.metricInvocations({
                period: Duration.minutes(3),
            });

            const uuid = getUUID().split('-')[0];

            new Alarm(this.scope, `${this.config.AppPrefix}-${lambda.node.id}-error-alarm`, {
                metric: errorMetric,
                threshold: 5,
                comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 3,
                alarmDescription: `${this.config.AppPrefix} errors over 3 min period`,
                alarmName: `${this.config.AppPrefix}-${lambda.node.id}-error-alarm`
            });

            new Alarm(this.scope, `${this.config.AppPrefix}-${lambda.node.id}-duration-alarm`, {
                metric: durationMetric,
                threshold: 1,
                comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 3,
                alarmDescription: `${this.config.AppPrefix}-${lambda.node.id} duration errors over 3 min period`,
                alarmName: `${this.config.AppPrefix}-${lambda.node.id}-duration-alarm`
            });

            const invocationAlarm = new Alarm(this.scope, `${this.config.AppPrefix}-${lambda.node.id}-invocation-alarm`, {
                metric: errorMetric,
                threshold: 1000,
                comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 3,
                alarmDescription: `${this.config.AppPrefix}-${lambda.node.id} errors over 3 min period`,
                alarmName: `${this.config.AppPrefix}-${lambda.node.id}-invocation-Metric-alarm`
            });
        });
    }

    public static getIdForLambda(lambdaProp: TsgLambdaProp, appConfig: AppConfig) {
        return `${appConfig.AppPrefix}-${lambdaProp.name}`.toLowerCase();
    }

    private createRecordForLambda(lambdas: NodejsFunction[]) {

        const names = this.config.RESOURCES.LAMBDA.map((lambda) => {
            return lambda.name;
        });

        const lambdaNames = [...names] as const;

        type LambdaName = typeof lambdaNames[number];


        const lambdaRecord: Record<LambdaName, NodejsFunction> = {} as Record<LambdaName, NodejsFunction>;

        lambdas.forEach((lambda, idx) => {
            lambdaRecord[lambdaNames[idx] as LambdaName] = lambdas[idx];
        });

        return lambdaRecord;
    }
}


