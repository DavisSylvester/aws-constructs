import { IRole } from "aws-cdk-lib/aws-iam/lib";

export interface LambdaProps {
  functionName: string;
  appPrefix?: string;
  codePath?: string;
  memory?: number;
  envs?: Record<string, string>;
  role?: IRole;
  dynamoTableNames?: string[];
  lambdaLayerArn?: string[];
  projectRoot?: string;
  depsLockFilePath?: string;
  timeoutInMinutes?: number;
}
