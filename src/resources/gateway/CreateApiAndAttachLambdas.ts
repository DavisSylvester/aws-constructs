import { Construct } from "constructs";
import { BaseResource } from "../base/baseResource";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { AppConfig } from "../../config/AppConfig";
import { ApiLambdaResult } from "../../interfaces/ApiLambdaResult";
import { TsgAuthorizerType } from "../../config/types/TsgAuthorizerType";
import { IRestApi, RequestAuthorizer, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { TsgJwtTokenAuthorizer } from "../lambda-authorizer/TsgJwtTokenAuthorizer";
import { RemovalPolicy } from "aws-cdk-lib";
import { TsgRequestAuthorizer } from "../lambda-authorizer/TsgRequestAuthorizer";
import { CreateLambda } from "../lambda/createLambda";
import { TsgLambdaProps } from "../../config/types/TsgLambdaProps";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { TsgLambdaProp } from "../../config/types";
import { Routes } from "../helpers/createRoutes";

export class CreateApiAndAttachLambdas extends BaseResource<ApiLambdaResult> {
    
    protected requireAuthorizer: boolean;
    protected authorizer?: TsgAuthorizerType;

    constructor(scope: Construct,
        config: AppConfig,
        private gatewayApi: IRestApi,
        private layers?: LayerVersion[],
        private tables?: ITable[]) {
        super(scope, config);
console.log('this.config', this.config);
        this.requireAuthorizer = (this.config.RESOURCES.AUTHORIZER && 
            this.config.RESOURCES.AUTHORIZER.type) ? true : false;

        console.log('this.requireAuthorizer', this.requireAuthorizer);

        if (this.requireAuthorizer) {
            this.authorizer = this.config.RESOURCES.AUTHORIZER?.type;
        } else if (this.config.RESOURCES.AUTHORIZER && !this.config.RESOURCES.AUTHORIZER.type) {
            throw new Error(`You must provide an authorizer type if a Authorizer is required`);
        }

        this.onInit();
    }

    protected createResource(scope: Construct): any[] | null {

        return null;
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {
        return;
    }

    private onInit() {

        let authorizer: TokenAuthorizer | RequestAuthorizer | undefined | null = undefined;

        // Create Authorizer
        if (this.requireAuthorizer) {
            authorizer = this.createAuthorizer();
        }

        // Create Lambdas
        const lambdas = new CreateLambda(this.scope, this.config, this.layers);
        
        // Give Access to Lambdds to All DynamoDb Tables
        if (this.tables) {
            this.assignAccessToTables(this.tables, lambdas.Lambdas);
        }

        // Create Routes on API Gateway for Lambdas from config
        this.AddRoutes(this.config, this.gatewayApi, lambdas.Lambdas, authorizer || undefined);

        return lambdas.Lambdas;
    }

    private createAuthorizer() {

        let authorizer: TokenAuthorizer | RequestAuthorizer | undefined = undefined;

        if (this.requireAuthorizer && this.authorizer === TsgAuthorizerType.TOKEN_AUTHORIZER) {

            authorizer = new TsgJwtTokenAuthorizer(this.scope,
                this.config).JwtAuthorizer;

            authorizer?._attachToApi(this.gatewayApi);
            authorizer?.applyRemovalPolicy(RemovalPolicy.DESTROY);

            return authorizer;

        } else if (this.requireAuthorizer && this.authorizer === TsgAuthorizerType.REQUEST_AUTHORIZER) {
            authorizer = new TsgRequestAuthorizer(this.scope,
                this.config).RequestAuthorizer as RequestAuthorizer;

            authorizer?._attachToApi(this.gatewayApi);
            authorizer?.applyRemovalPolicy(RemovalPolicy.DESTROY);

            return authorizer;
        }
        return null;
    }

    private assignAccessToTables(tables: ITable[], lambdas: NodejsFunction[]) {

        if (tables) {
            lambdas.forEach((lambda: NodejsFunction) => {

                tables.forEach((table: ITable) => {

                    table.grantReadWriteData(lambda);

                });
            });
        }
    }

    private AddRoutes(config: AppConfig,
        gateway: IRestApi,
        lambdas: NodejsFunction[],
        authorizer?: TokenAuthorizer|RequestAuthorizer) {

        config.RESOURCES.LAMBDA?.forEach((prop: TsgLambdaProp) => {

            const lambdaId = CreateLambda.getIdForLambda(prop, this.config);

            if (!lambdaId) {
                throw new Error(`Can't find lambda`);
            }
            const lambdaNode = lambdas.find(x => x.node.id === lambdaId);

            if (!lambdaNode) {
                throw new Error("Can't find the Lambda Integration");
            }

            Routes.createResource(prop, gateway, lambdaNode, authorizer);

        });
    }
}