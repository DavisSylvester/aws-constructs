import { IRestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { MicroserviceProps } from "../interfaces/MicroserviceProps";
import { AppConfig } from "./AppConfig";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";

export interface ServiceBundleConfig {
    scope: Construct, 
    readonly gatewayApi: IRestApi, 
    readonly props: MicroserviceProps,        
    readonly appConfig: AppConfig,
    readonly tables?: Table[], 
    readonly secretMgr?: ISecret, 
    readonly layers?: LayerVersion[]

}