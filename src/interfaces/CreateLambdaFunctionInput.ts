import { IRole } from "aws-cdk-lib/aws-iam";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { TsgLambdaProp } from "../config/types";
import { TsgLambdaProps } from "../config/types/TsgLambdaProps";

export interface CreateLambdaFunctionInput {
    prop: TsgLambdaProp;
    role?: IRole;
    layers?: LayerVersion[],
    props?: TsgLambdaProps
}