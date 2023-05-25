import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { MicroserviceProps } from "../interfaces/MicroserviceProps";
import { CreateMicroServiceBundle } from "../resources/gateway/createMicroServiceBundle";
import { CreateDynamoDb } from "../resources/dynamodb/CreateDynamo";
import { Api } from "../resources/gateway/createApi";
import { getSecretManager } from "../resources/securityManager";
import { createCommonLayer } from "../resources/helpers/createCommonLayer";
import { AppConfig } from "../config/AppConfig";
import { Tags } from "aws-cdk-lib";
import { TsgLambdaProps } from "../config/types/TsgLambdaProps";
import { TsgLambdaProp } from "../config/types";

export class MicroService extends Construct {

    protected readonly requireDynamoTables: boolean;  
    protected appConfig: AppConfig;

    constructor(scope: Construct, id: string, props: MicroserviceProps) {
        super(scope, id);

        this.appConfig = new AppConfig(props);

        this.requireDynamoTables = (props.RESOURCES.DYNAMO?.TABLES &&
            props.RESOURCES.DYNAMO.TABLES.length > 0) ? true : false;

        this.onInit(scope, this.appConfig);

        this.createTag(scope)
    }

    private onInit(scope: Construct, props: AppConfig) {

        let tables: Table[] | undefined = undefined;


        if (process.env.SECRET_MANAGER_ARN) {
            // throw new Error(`You must provide the ARN for the your Configuration Secret 
            //     Manager`);      
             const secretMgr = getSecretManager(scope, props, process.env.SECRET_MANAGER_ARN);            
        }

       

        // const commonLayer = createCommonLayer(scope, props);

        const gateway = new Api(scope, this.appConfig).APIs;

        const layers = undefined; // [commonLayer];

        // Creates DynamoDb Tables if required
        if (this.requireDynamoTables) {
            const dynamo = new CreateDynamoDb(scope, this.appConfig);

            tables = dynamo.CreatedTables;
        }

        // props.RESOURCES.LAMBDA.forEach((lambdaProp: TsgLambdaProp) => {
            
        const result = new CreateMicroServiceBundle(scope, 
                gateway[0], props, this.appConfig, tables, null, layers);
        // });

        
    }

    protected createTag(scope: Construct) {
        Tags.of(scope).add('App', this.appConfig.AppName);
        Tags.of(scope).add('ResoucePrefix', this.appConfig.AppPrefix);
    }
}