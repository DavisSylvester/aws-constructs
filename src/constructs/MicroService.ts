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
export class MicroService extends Construct {

    protected readonly requireDynamoTables: boolean;
    protected requireSeedDatabase: boolean = false;
    protected readonly hasLambdaLayers: boolean = false;  
    protected appConfig: AppConfig;

    constructor(scope: Construct, id: string, props: MicroserviceProps) {
        super(scope, id);

        this.appConfig = new AppConfig(props);  
        
        console.log('this.appConfig', this.appConfig);
        console.log('props', props);
        
        this.requireDynamoTables = (props.RESOURCES.DYNAMO?.TABLES &&
            props.RESOURCES.DYNAMO.TABLES.length > 0) ? true : false;

        this.requireSeedDatabase = (props.RESOURCES.DYNAMO?.USE_SEED_DATABASE && 
            props.RESOURCES.DYNAMO.SEED_LAMBDA) ? true : false;

        this.hasLambdaLayers = (props.RESOURCES.LAMBDA_LAYERS && 
            props.RESOURCES.LAMBDA_LAYERS.length > 0) ? true : false;

        this.onInit(scope);

        this.createTag(scope)
    }

    private onInit(scope: Construct) {

        let tables: Table[] | undefined = undefined;
        let commonLayers: LayerVersion[] | undefined = undefined;

        if (process.env.SECRET_MANAGER_ARN) {
            // throw new Error(`You must provide the ARN for the your Configuration Secret 
            //     Manager`);      
             const secretMgr = getSecretManager(scope, this.appConfig, process.env.SECRET_MANAGER_ARN);            
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

               console.log('myConfig', this.appConfig);

              
        // CREATE API GATEWAY AND LAMBDA HERE 
        const apiGateway = new CreateApiAndAttachLambdas(scope, this.appConfig, gateway[0], layers,tables);
       
    }

    protected createTag(scope: Construct) {
        Tags.of(scope).add('App', this.appConfig.AppName);
        Tags.of(scope).add('ResoucePrefix', this.appConfig.AppPrefix);
    }
}