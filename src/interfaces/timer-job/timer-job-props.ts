import { CronOptions } from "aws-cdk-lib/aws-events/lib/schedule";
import { IRole } from "aws-cdk-lib/aws-iam/lib";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";

export interface TimerJobProps {

    functionName: string;
    appPrefix: string;
    codePath: string;
    timeoutInMinutes: number;
    memory: number;
    envs: Record<string, string>;
    role?: IRole;    
    cronOptions: CronOptions;
    dynamoTableNames?: string[];
    lambdaLayerArn?: string[];
}