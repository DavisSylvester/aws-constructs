import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { TsgLambdaProp } from "./TsgLambdaProp";

export type TsgLambdaNode = [TsgLambdaProp, NodejsFunction, NodejsFunctionProps];