import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { TsgLambdaNode } from "./TsgLambdaNode";

export type TsgLambdaMap = [NodejsFunction[], Map<string, TsgLambdaNode>]