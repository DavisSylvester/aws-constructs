import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { MicroserviceProps } from "../interfaces/MicroserviceProps";
import { CreateDynamoDb } from "../resources/dynamodb/CreateDynamo";
import { Api } from "../resources/gateway/createApi";
import { getSecretManager } from "../resources/securityManager";
import { createCommonLayer } from "../resources/helpers/createCommonLayer";
import { AppConfig } from "../config/AppConfig";
import { Tags } from "aws-cdk-lib";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { CreateApiAndAttachLambdas } from "../resources/gateway/CreateApiAndAttachLambdas";
import { createSeedDatabaseCustomResource } from "../resources/customResource/createSeedDatabaseCustomResource";
import { IRestApi } from "aws-cdk-lib/aws-apigateway";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Environment } from "../config/Environments";
import { Logger } from "../helpers/logger";
export class MicroService extends Construct {

    protected readonly requireDynamoTables: boolean;
    protected requireSeedDatabase: boolean = false;
    protected readonly hasLambdaLayers: boolean = false;
    protected appConfig: AppConfig;
    private readonly api: IRestApi;
    private readonly dynamoTables: Table[] | undefined;
    private readonly lambdaLayers: LayerVersion[] | undefined;
    private readonly secretManager: ISecret | null = null;
    private readonly lambdas: NodejsFunction[] = [];
    private lambdaRecords: Record<string, NodejsFunction> = {};

    public get Tables() {
        return this.dynamoTables;
    }

    public get SecretManager() {
        return this.secretManager;
    }

    public get LambdaLayers() {
        return this.lambdaLayers;
    }

    public get Lambdas() {
        return this.lambdas;
    }

    public get LambdaRecords() {
        return this.lambdaRecords;
    }

    public get RestApi() {
        return this.api;
    }

    constructor(scope: Construct, id: string, props: MicroserviceProps,
        private logger: Logger = new Logger()) {
        super(scope, id);

        this.appConfig = new AppConfig(props);

        this.requireDynamoTables = (props.RESOURCES.DYNAMO?.TABLES &&
            props.RESOURCES.DYNAMO.TABLES.length > 0) ? true : false;

        this.requireSeedDatabase = (props.RESOURCES.DYNAMO?.USE_SEED_DATABASE &&
            props.RESOURCES.DYNAMO.SEED_LAMBDA) ? true : false;

        this.hasLambdaLayers = (props.RESOURCES.LAMBDA_LAYERS &&
            props.RESOURCES.LAMBDA_LAYERS.length > 0) ? true : false;

        const results = this.onInit(scope);

        this.api = results.restApi!;
        this.dynamoTables = results.dynamoTables!;
        this.lambdaLayers = results.lambdaLayers!;
        this.secretManager = results.secretManager!;

        this.lambdas = results.lambdas!;

        this.createTag(scope)
    }

    private onInit(scope: Construct) {

        let secretManager: ISecret | null = null;
        let tables: Table[] | undefined = undefined;
        let commonLayers: LayerVersion[] | undefined = undefined;

        if (process.env.SECRET_MANAGER_ARN) {
            // throw new Error(`You must provide the ARN for the your Configuration Secret 
            //     Manager`);      
            secretManager = getSecretManager(scope, this.appConfig, process.env.SECRET_MANAGER_ARN);
        }

        if (this.hasLambdaLayers) {
            commonLayers = createCommonLayer(scope, this.appConfig);
        }

        const gateway = new Api(scope, this.appConfig).APIs;

        const layers = commonLayers;

        // Creates DynamoDb Tables if required
        if (this.requireDynamoTables) {
            const dynamo = new CreateDynamoDb(scope, this.appConfig);

            tables = dynamo.CreatedTables;
        }

        if (this.requireSeedDatabase) {
            createSeedDatabaseCustomResource(scope, this.appConfig, tables![0], layers);
        }

        // CREATE API GATEWAY AND LAMBDA HERE 
        const apiGateway = new CreateApiAndAttachLambdas(scope, this.appConfig, gateway[0], layers, tables);

        this.lambdaRecords = apiGateway.LambdaRecords;


        this.logger.log(`lambda Records: ${this.lambdaRecords}`);

        return {
            restApi: (gateway?.length > 0) ? gateway[0] : null,
            lambdaLayers: layers || null,
            dynamoTables: tables || null,
            secretManager: secretManager,
            lambdas: apiGateway.Lambdas,

        };

    }

    protected createTag(scope: Construct) {
        Tags.of(scope).add('App', this.appConfig.AppName);
        Tags.of(scope).add('ResoucePrefix', this.appConfig.AppPrefix);
    }
}