import { Token } from "aws-cdk-lib";
import { IRestApi, RequestAuthorizer, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";

export interface ApiLambdaResult {
    api:  IRestApi;
    authorizer: TokenAuthorizer | RequestAuthorizer | undefined | null;
}