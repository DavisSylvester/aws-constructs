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
import { LambdaProps } from "../../interfaces/lambda";
import { Construct } from "constructs";
import { Table } from "aws-cdk-lib/aws-dynamodb";

export const createBasicLambda = (
  scope: Construct,
  props: LambdaProps
): NodejsFunction => {
  const lambdaProps = createBasicLambdaProps(props);

  const functionName = `${props.appPrefix || ""}${props.functionName}`;

  let lambdaFunction = new NodejsFunction(scope, functionName, lambdaProps);

  grantAccessToDynamoTables(
    scope,
    lambdaFunction,
    functionName,
    props.dynamoTableNames
  );

  addLambdaLayers(scope, lambdaFunction, functionName, props.lambdaLayerArn);

  return lambdaFunction;
};

const createBasicLambdaProps = (props: LambdaProps): NodejsFunctionProps => {
  let resolvedEntry: string;
  let depsLockFilePath: string | undefined = props.depsLockFilePath;

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
      `resources/lambdas/${props.functionName}/main.mts`
    );
  } else if (props.codePath) {
    // codePath without projectRoot
    resolvedEntry = path.resolve(process.cwd(), props.codePath);
  } else {
    // Default path without projectRoot
    resolvedEntry = path.join(
      `./resources/lambdas/${props.functionName}/main.mts`
    );
  }

  // When projectRoot is provided, override depsLockFilePath to point to the projectRoot's lock file
  if (props.projectRoot && !depsLockFilePath) {
    const lockFiles = ["pnpm-lock.yaml", "yarn.lock", "package-lock.json"];
    for (const lockFile of lockFiles) {
      const lockPath = path.join(props.projectRoot, lockFile);
      if (require("fs").existsSync(lockPath)) {
        depsLockFilePath = lockPath;
        break;
      }
    }
  }

  const lambdaProp: NodejsFunctionProps = {
    entry: resolvedEntry,
    functionName: `${props.appPrefix ? `${props.appPrefix}-` : ""}${
      props.functionName
    }`,
    handler: "index.main",
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
      ...(depsLockFilePath && {
        depsLockFilePath: depsLockFilePath,
      }),
    },
    role: props.role,
    layers: undefined,
  };

  return lambdaProp;
};

const grantAccessToDynamoTables = (
  scope: Construct,
  lambda: NodejsFunction,
  functionName: string,
  tableNames?: string[]
) => {
  if (tableNames && tableNames.length > 0) {
    tableNames.forEach((tableName, idx) => {
      const table = Table.fromTableName(
        scope,
        `${tableName}-table-${idx}`,
        tableName
      );

      table.grantReadWriteData(lambda);
    });
  }
};

const addLambdaLayers = (
  scope: Construct,
  lambda: NodejsFunction,
  functionName: string,
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
