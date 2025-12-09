import { Duration } from "aws-cdk-lib";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
  SourceMapMode,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import path = require("path");
import { TimerJobProps } from "../../interfaces/timer-job";
import { Construct } from "constructs";
import { SERVICE_PRINCIPAL } from "../../constants/aws-service-principal-constants";
import { CronOptions, Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Table } from "aws-cdk-lib/aws-dynamodb";

export const createBasicLambdaTimerJob = (
  scope: Construct,
  props: TimerJobProps
): NodejsFunction => {
  const lambdaProps = createBasicLambdaProps(props);

  let lambdaFunction = new NodejsFunction(
    scope,
    `${props.appPrefix}${props.functionName}`,
    lambdaProps
  );

  addInvokePermissionToLambdaForEvents(lambdaFunction, props.functionName);

  const eventRule = createEventRuleForLambda(
    scope,
    lambdaFunction,
    props.cronOptions
  );

  eventRule.addTarget(new LambdaFunction(lambdaFunction));

  grantAccessToDynamoTables(scope, lambdaFunction, props.dynamoTableNames);

  addLambdaLayers(scope, lambdaFunction, props.lambdaLayerArn);

  return lambdaFunction;
};

const createBasicLambdaProps = (props: TimerJobProps): NodejsFunctionProps => {
  let resolvedEntry: string;

  if (props.codePath && path.isAbsolute(props.codePath)) {
    resolvedEntry = props.codePath;
  } else if (props.codePath && props.projectRoot) {
    // codePath is relative, resolve from current directory + projectRoot
    resolvedEntry = path.resolve(process.cwd(), props.codePath);
  } else if (props.projectRoot) {
    // No codePath, use default path with projectRoot
    resolvedEntry = path.resolve(
      process.cwd(),
      props.projectRoot,
      `resources/lambdas/timer-jobs/${props.functionName}/main.mts`
    );
  } else if (props.codePath) {
    // codePath without projectRoot
    resolvedEntry = path.resolve(process.cwd(), props.codePath);
  } else {
    // Default path without projectRoot
    resolvedEntry = path.join(
      `./resources/lambdas/timer-jobs/${props.functionName}/main.mts`
    );
  }

  const lambdaProp: NodejsFunctionProps = {
    entry: resolvedEntry,
    functionName: `${props.appPrefix ? `${props.appPrefix}-` : ""}${
      props.functionName
    }`,
    handler: "main.ts",
    logRetention: RetentionDays.TWO_WEEKS,
    runtime: Runtime.NODEJS_LATEST,
    timeout: Duration.minutes(
      props.timeoutInMinutes ? props.timeoutInMinutes : 1
    ),
    memorySize: props.memory,
    environment: {
      ...props.envs,
    },
    bundling: {
      minify: true,
      target: `esnext`,
      sourceMap: true,
      sourceMapMode: SourceMapMode.EXTERNAL,
      environment: {
        ...props.envs,
      },
      ...(props.projectRoot && { projectRoot: props.projectRoot }),
      ...(props.depsLockFilePath && {
        depsLockFilePath: props.depsLockFilePath,
      }),
    },
    role: props.role,
    layers: undefined,
  };

  return lambdaProp;
};

const addInvokePermissionToLambdaForEvents = (lambda: NodejsFunction, functionName: string) => {
  lambda.addPermission(`InvokePermission-${functionName}`, {
    principal: new ServicePrincipal(SERVICE_PRINCIPAL.EVENTS),
  });
};

const createEventRuleForLambda = (
  scope: Construct,
  lambda: NodejsFunction,
  options: CronOptions
) => {
  const eventRule = new Rule(
    scope,
    `scheduleRule-${lambda?.node.id || "010"}`,
    {
      schedule: Schedule.cron(options),
    }
  );

  return eventRule;
};

const grantAccessToDynamoTables = (
  scope: Construct,
  lambda: NodejsFunction,
  tableNames?: string[]
) => {
  if (tableNames && tableNames.length > 0) {
    tableNames.forEach((tableName) => {
      const table = Table.fromTableName(scope, `${tableName}-table`, tableName);

      table.grantReadWriteData(lambda);
    });
  }
};

const addLambdaLayers = (
  scope: Construct,
  lambda: NodejsFunction,
  layerArns?: string[]
) => {
  if (layerArns && layerArns.length > 0) {
    layerArns.forEach((arn: string, idx: number) => {
      const layer = LayerVersion.fromLayerVersionArn(
        scope,
        `common-layer-${idx}`,
        arn
      );

      lambda.addLayers(layer);
    });
  }
};
