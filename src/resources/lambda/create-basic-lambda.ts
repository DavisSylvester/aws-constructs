import { Duration } from "aws-cdk-lib";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps, SourceMapMode } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import path = require("path");
import { TimerJobProps } from "../../interfaces/timer-job";
import { Construct } from "constructs";
import { SERVICE_PRINCIPAL } from "../../constants/aws-service-principal-constants";
import { CronOptions, Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Table } from "aws-cdk-lib/aws-dynamodb";



export const createBasicLambdaTimerJob = (scope: Construct, props: TimerJobProps) => {

    const lambdaProps = createBasicLambdaProps(props);

    let lambdaFunction = new NodejsFunction(scope, `${props.appPrefix}${props.functionName}`, lambdaProps);

    addInvokePermissionToLambdaForEvents(lambdaFunction);

    const eventRule = createEventRuleForLambda(scope, lambdaFunction, props.cronOptions);

    eventRule.addTarget(new LambdaFunction(lambdaFunction));

    grantAccessToDynamoTables(scope, lambdaFunction, props.dynamoTableNames);
   
    addLambdaLayers(scope, lambdaFunction, props.lambdaLayerArn);
};

const createBasicLambdaProps = (props: TimerJobProps) => {

         const lambdaProp: NodejsFunctionProps = {
            entry: (props.codePath) ? path.join(props.codePath) : path.join(`./resources/lambdas/timer-jobs/${props.functionName}/main.mts`),
            functionName: `${(props.appPrefix) ? `${props.appPrefix}-` : ''}${props.functionName}`,
            handler: 'main.ts',
            logRetention: RetentionDays.TWO_WEEKS,
            runtime: Runtime.NODEJS_LATEST,
            timeout: Duration.minutes((props.timeoutInMinutes) ? props.timeoutInMinutes : 1),
            memorySize: props.memory,
            environment: {                
                ...props.envs
            },
            bundling: {
                minify: true,
                target: `esnext`,
                sourceMap: true,
                sourceMapMode: SourceMapMode.EXTERNAL,
                environment: {
                    ...props.envs
                }
            },
           role: props.role,
           layers: undefined
        }

        return lambdaProp;
};

const addInvokePermissionToLambdaForEvents = (lambda: NodejsFunction) => {

     lambda.addPermission(`InvokePermission-${lambda.functionName}`, {
            principal: new ServicePrincipal(SERVICE_PRINCIPAL.EVENTS),
        });
};

const createEventRuleForLambda = (scope: Construct, lambda: NodejsFunction, options: CronOptions) => {
     
    const eventRule = new Rule(scope, `scheduleRule-${lambda?.node.id || '010'}`, {
            schedule: Schedule.cron(options),
     });

    return eventRule;
};

const grantAccessToDynamoTables = (scope: Construct, lambda: NodejsFunction, tableNames?: string[]) => {

    if (tableNames && tableNames.length > 0) {            

            tableNames.forEach(tableName => {

                const table = Table.fromTableName(scope, `${tableName}-table`, tableName);

                table.grantReadWriteData(lambda);
            });
        
            

        }
};

const addLambdaLayers = (scope: Construct, lambda: NodejsFunction, layerArns?: string[]) => {

    if (layerArns &&  layerArns.length > 0) {
        layerArns.forEach((arn: string, idx: number) => {
            const layer = LayerVersion.fromLayerVersionArn(scope, `common-layer-${idx}`, arn);

            lambda.addLayers(layer);
            
        });
    }
};
