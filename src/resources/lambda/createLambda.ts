import { CfnOutput, Duration } from "aws-cdk-lib";
import { TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { Alarm, ComparisonOperator, IAlarmAction } from "aws-cdk-lib/aws-cloudwatch";
import { IRole, ManagedPolicy } from "aws-cdk-lib/aws-iam";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from 'path';
import { AppConfig } from "../../config/AppConfig";
import { TsgBundleProp, TsgLambdaProp } from "../../config/types";

import { TsgLambdaProps } from "../../config/types/TsgLambdaProps";
import { CreateLambdaFunctionInput } from "../../interfaces/CreateLambdaFunctionInput";
import { BaseResource } from "../base/baseResource";


export class CreateLambda extends BaseResource<NodejsFunction> {

    public Lambdas: NodejsFunction[] = [];
    

    constructor(private props: TsgLambdaProps, config: AppConfig) {
        super(props.scope, config);

        const resources = this.createResource(props.scope);

        this.Lambdas = [...resources];

        this.createAlarmsForLambdas(this.Lambdas);
        
        this.createOutput(props.scope, resources);
    }

    protected createResource(scope: Construct): NodejsFunction[] {

        const result = this.createLambdas(this.props);
        
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

    private createLambdas(props: TsgLambdaProps): NodejsFunction[] {
        
        const createdLambdas: NodejsFunction[] = this.createLambdaFunctions(this.scope, props.role, props.layers);

        return createdLambdas;
    }

    private createLambdaFunctions(scope: Construct, role?: IRole, layers?: LayerVersion[]) {

        //console.log("ENTER createLambdaFunctions");
        const createdLambdas = this.props.bundle.LAMBDA.map((config:TsgLambdaProp) => {

            //console.log("ENTER createLambdaFunctions.map for " + config.name);
            let lambdaProps = this.createLambdaProps(config, role, layers);

            const lambdaId = CreateLambda.getIdForLambda(this.props.bundle, config);
            let fctn = new NodejsFunction(scope, lambdaId, lambdaProps);

            //  If we have managed policies, we add them.
            if (config.managedPolicies && config.managedPolicies?.length > 0) {
                
                this.assignManagedPolicies(fctn, config.managedPolicies);
            }

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
            functionName: `${this.props.appConfig.AppPrefix}-${prop.name}`,
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
            role,
            layers

        }

        
        return lambdaProp;
    };

    private assignManagedPolicies(lambda: NodejsFunction, managedPolicyNames: string[]) {

        managedPolicyNames.forEach((managedPolicyName: string) => {

            let policy = ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName);

            lambda.role?.addManagedPolicy(policy);
        });

    }

    private createAlarmsForLambdas(lambdas: NodejsFunction[]) {        

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

            new Alarm(this.props.scope, `${this.config.AppPrefix}-${idx}-error-alarm`, {
                metric: errorMetric, 
                threshold: 5,
                comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 3,
                alarmDescription: `${this.config.AppPrefix}-${idx} errors over 3 min period`,
                alarmName: `${this.config.AppPrefix}-${idx}-error-alarm`
            });

            new Alarm(this.props.scope, `${this.config.AppPrefix}-${idx}-duration-alarm`, {
                metric: durationMetric, 
                threshold: 1,
                comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 3,
                alarmDescription: `${this.config.AppPrefix}-${idx} duration errors over 3 min period`,
                alarmName: `${this.config.AppPrefix}-${idx}-duration-alarm`
            });

            const invocationAlarm = new Alarm(this.props.scope, `${this.config.AppPrefix}-${idx}-invocation-alarm`, {
                metric: errorMetric, 
                threshold: 1000,
                comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
                evaluationPeriods: 3,
                alarmDescription: `${this.config.AppPrefix}-${idx} errors over 3 min period`,
                alarmName: `${this.config.AppPrefix}-${idx}-invocation-Metric-alarm`
            });

            // const alarmAction: IAlarmAction = {};
            // invocationAlarm.addAlarmAction(alarmAction);
        });
    }

    public static getIdForLambda(bundleProp: TsgBundleProp, lambdaProp: TsgLambdaProp) {
        return `${lambdaProp.name}-${bundleProp.version}-fctn`.toLowerCase();
    }
}