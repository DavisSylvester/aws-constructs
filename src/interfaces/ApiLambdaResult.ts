import { IRestApi } from "aws-cdk-lib/aws-apigateway";

export interface ApiLambdaResult {
    api:  IRestApi;
    
}