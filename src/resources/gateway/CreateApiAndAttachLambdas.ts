import { Construct } from "constructs";
import { BaseResource } from "../base/baseResource";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { AppConfig } from "../../config/AppConfig";
import { ApiLambdaResult } from "../../interfaces/ApiLambdaResult";
import { TsgAuthorizerType } from "../../config/types/TsgAuthorizerType";
import { IRestApi, RequestAuthorizer, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { TsgJwtTokenAuthorizer } from "../lambda-authorizer/TsgJwtTokenAuthorizer";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { TsgRequestAuthorizer } from "../lambda-authorizer/TsgRequestAuthorizer";
import { CreateLambda } from "../lambda/createLambda";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { TsgLambdaProp } from "../../config/types";
import { Routes } from "../helpers/createRoutes";
import { Environment } from "../../config/Environments";

export class CreateApiAndAttachLambdas extends BaseResource<ApiLambdaResult> {

    protected requireAuthorizer: boolean;
    protected authorizerType?: TsgAuthorizerType;

    private lambdas: NodejsFunction[] = [];
    private lambdaRecords: Record<string, NodejsFunction> = {};

    public get Lambdas() {
        return this.lambdas;
    }

    public get LambdaRecords() {
        return this.lambdaRecords;
    }

    constructor(scope: Construct,
        config: AppConfig,
        private gatewayApi: IRestApi,
        private env: Environment,
        private layers?: LayerVersion[],
        private tables?: ITable[]) {
        super(scope, config);

        this.requireAuthorizer = (this.config.RESOURCES.AUTHORIZER &&
            this.config.RESOURCES.AUTHORIZER.type) ? true : false;

        if (this.requireAuthorizer) {
            this.authorizerType = this.config.RESOURCES.AUTHORIZER?.type;
        } else if (this.config.RESOURCES.AUTHORIZER && !this.config.RESOURCES.AUTHORIZER.type) {
            throw new Error(`You must provide an authorizer type if a Authorizer is required`);
        }

        this.createdResources = this.createResource(scope)!;
    }

    protected createResource(scope: Construct): ApiLambdaResult[] | null {

        let authorizer: TokenAuthorizer | RequestAuthorizer | undefined | null = undefined;

        // Create Authorizer
        if (this.requireAuthorizer) {
            authorizer = this.createAuthorizer();

            if (!authorizer) {
                // console.log('Authorizer Not Created');
            }
            else {
                // console.log('Authorizer Created', authorizer);
            }
        }

        // Create Lambdas
        const lambdas = new CreateLambda(scope, this.config, this.env, this.layers,);
        this.lambdas = lambdas.Lambdas;
        this.lambdaRecords = this.lambdaRecords;

        // Give Access to Lambdds to All DynamoDb Tables
        if (this.tables) {
            this.assignAccessToTables(this.tables, lambdas.Lambdas);
        }

        // Create Routes on API Gateway for Lambdas from config
        this.AddRoutes(this.config, this.gatewayApi, lambdas.Lambdas, this.env, authorizer);

        const result: ApiLambdaResult = {
            api: this.gatewayApi,
            authorizer: authorizer
        };
        return [result];
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {

        this.createdResources!.forEach((x, idx) => {
            new CfnOutput(scope, `Authorizerr-${idx}`, {
                value: x.authorizer?.authorizerArn!
            });
        });
    }

    private createAuthorizer() {

        let authorizer: TokenAuthorizer | RequestAuthorizer | undefined = undefined;

        if (this.requireAuthorizer && this.authorizerType === TsgAuthorizerType.TOKEN_AUTHORIZER) {

            authorizer = new TsgJwtTokenAuthorizer(this.scope,
                this.config).JwtAuthorizer;

            (authorizer as TokenAuthorizer)?._attachToApi(this.gatewayApi);
            (authorizer as TokenAuthorizer)?.applyRemovalPolicy(RemovalPolicy.DESTROY);

            return authorizer;

        } else if (this.requireAuthorizer && this.authorizerType === TsgAuthorizerType.REQUEST_AUTHORIZER) {

            authorizer = new TsgRequestAuthorizer(this.scope,
                this.config, this.layers, this.tables).TsgRequestAuthorizer as RequestAuthorizer;

            (authorizer as RequestAuthorizer)._attachToApi(this.gatewayApi);
            (authorizer as RequestAuthorizer).applyRemovalPolicy(RemovalPolicy.DESTROY);

            return authorizer;
        }


        return authorizer;
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
        env: Environment,
        authorizer?: TokenAuthorizer | RequestAuthorizer) {

        console.log('ENV:', env);

        config.RESOURCES.LAMBDA?.forEach((prop: TsgLambdaProp) => {

            const lambdaId = CreateLambda.getIdForLambda(prop, this.config, env);

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