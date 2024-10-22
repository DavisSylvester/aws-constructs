import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { TsgLambdaRoutable } from "./TsgLambdaRoutable";
import { LogDuration } from "./LogDuration";
import { TsgAuthorizerType } from "./TsgAuthorizerType";

export interface TsgLambdaProp {

    name: string;
    codePath: string;
    handler: string;
    duration?: Duration;
    environment?: { [name: string]: string };
    runtime?: Runtime;
    memory?: number;    
    apiGateway?: TsgLambdaRoutable;
    managedPolicies?: string[];
    logDuration?: LogDuration;
    
} 