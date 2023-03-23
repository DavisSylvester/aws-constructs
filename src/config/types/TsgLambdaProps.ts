import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { IRole } from "aws-cdk-lib/aws-iam";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";
import { TsgCognitoConfig } from "./TsgCognitoConfig";
import { AppConfig } from "../AppConfig";

export interface TsgLambdaProps {

    scope: Construct;
    prop: MicroserviceProps;
    appConfig: AppConfig;
    role?: IRole;
    poolArn?: IUserPool;
    layers?: LayerVersion[];
    tsgCognito?: TsgCognitoConfig;
    
}