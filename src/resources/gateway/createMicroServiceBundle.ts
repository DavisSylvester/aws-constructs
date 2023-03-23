import { IRestApi, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { TsgDynamoTableRef, TsgLambdaProp } from "../../config/types";
import { TsgLambdaProps } from "../../config/types/TsgLambdaProps";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";
import { CreateAuthorizer } from "../helpers/createAuthorizer";
import { Routes } from "../helpers/createRoutes";
import { CreateLambda } from "../lambda/createLambda";
import { Duration, Stack } from "aws-cdk-lib";
import { CreateDynamoDb } from "../dynamodb/CreateDynamo";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { AppConfig } from "../../config/AppConfig";
import { MetricOptions } from "aws-cdk-lib/aws-cloudwatch";

export class CreateMicroServiceBundle {
    
    protected readonly requireDynamoTableRefs: boolean;
    protected readonly requireAuthorizer: boolean;

    constructor(scope: Construct, 
        private readonly gatewayApi: IRestApi, 
        private readonly props: MicroserviceProps,
        private readonly appConfig: AppConfig,
        private readonly tables?: Table[], 
        private readonly secretMgr?: ISecret, 
        private readonly layers?: LayerVersion[],
        ) {
        
        this.requireDynamoTableRefs = (props.RESOURCES.DYNAMO?.TABLE_REFS?.length ?? 0 > 0) ? true : false;
        this.requireAuthorizer = (props.RESOURCES.AUTHORIZER) ? true : false;
        this.onInit(scope);
    }

    private onInit(scope: Construct) {

        //console.log("ENTER CreateMicroServiceBundle.onInit");
        let authorizer: TokenAuthorizer|undefined = undefined;

        // Create Authorizer
        if (this.requireAuthorizer) {
            authorizer = new CreateAuthorizer(scope, this.appConfig, this.props.RESOURCES.AUTHORIZER!).JwtAuthorizer;   
        }        

        // Create Lambdas
        const lambdaProp: TsgLambdaProps = {
            scope,
            prop: this.props,            
            layers: this.layers,
            appConfig: this.appConfig
        };

        const lambdas = new CreateLambda(lambdaProp, this.appConfig);

        if (this.tables) {
            this.AssignAccessToTables(this.tables, lambdas.Lambdas);
        }        

        // Allow access to existing tables
        if (this.requireDynamoTableRefs) {
            this.AssignAccessToTableRefs(scope, this.props.RESOURCES.DYNAMO?.TABLE_REFS, lambdas.Lambdas);
        }

        if (this.secretMgr) {
            this.AssignAccessToSecretManager(this.secretMgr, lambdas.Lambdas);
        }        

        lambdas.Lambdas.map((lambda) => {
            lambda.metricErrors({                
                    label: `${lambda.functionName}-errors`, 
                    period: Duration.minutes(3)           
                
            })
        });

        this.AddRoutes(this.props, this.gatewayApi, lambdas.Lambdas, authorizer);
    }

    private AssignAccessToTables(tables: Table[], lambdas: NodejsFunction[]) {

        if (tables) {
            tables.forEach((table: ITable) => {

                lambdas.forEach((lambda: NodejsFunction) => {

                    //  This is a CDK bug: It doesn't provide
                    //  access to the indexes.
                    //table.grantReadWriteData(lambda);

                    //  Workaround:
                    lambda.addToRolePolicy(
                        new PolicyStatement({
                            effect: Effect.ALLOW,
                            actions: CreateDynamoDb.ReadWriteActions,
                            resources: [
                                table.tableArn,
                                `${table.tableArn}/*`, // This is not recognized by cdk, but table is.  why?
                            ],
                        })
                    );

                    
                    
                });

            });
        }
    }

    private AssignAccessToTableRefs(scope: Construct, tableRefs: TsgDynamoTableRef[] | undefined, lambdas: NodejsFunction[]) {

        if (tableRefs) {
            tableRefs.forEach((tableRef: TsgDynamoTableRef) => {

                if (tableRef.region) {
                    this.AssignReadWriteAccessToTableInRegion(scope, tableRef, lambdas);
                }
                else {
                    this.AssignReadWriteAccessToTable(scope, tableRef, lambdas);
                }
            });
        }
    }

    private AssignReadWriteAccessToTableInRegion(scope: Construct, tableRef: TsgDynamoTableRef, lambdas: NodejsFunction[]) {
        lambdas.forEach((lambda: NodejsFunction) => {

            let tableArn = "arn:aws:dynamodb:" + tableRef.region + ":" + ((scope as Stack).account) + ":table/" + tableRef.tableName;
            let statement = new PolicyStatement({
                effect: Effect.ALLOW,
                resources: [
                    tableArn,
                    tableArn + "/index/*",
                ],
                actions: CreateDynamoDb.ReadWriteActions,
            });

            lambda.role?.addToPrincipalPolicy(statement);
            
        });
    }

    private AssignReadWriteAccessToTable(scope: Construct, tableRef: TsgDynamoTableRef, lambdas: NodejsFunction[]) {
        let table: ITable = Table.fromTableName(scope, tableRef.tableName, tableRef.tableName);

        lambdas.forEach((lambda: NodejsFunction) => {
            table.grantReadWriteData(lambda)
            
        });
    }

    private AddRoutes(props: MicroserviceProps, 
        gateway: IRestApi, 
        lambdas: NodejsFunction[], 
        authorizer?: TokenAuthorizer) {

        this.appConfig.lambdaConfigs?.forEach((prop: TsgLambdaProp) => {

            const lambdaId = CreateLambda.getIdForLambda(prop);
            const lambdaNode = lambdas.find(x => x.node.id === lambdaId);

            if (!lambdaNode) {
                throw new Error("Can't find the Lambda Integration");                
            }

            Routes.createResource(prop, gateway, lambdaNode, authorizer);
        
        });
    }

    private AssignAccessToSecretManager(secret: ISecret, lambdas: NodejsFunction[]) {

        lambdas.forEach((lambda) => {
            const result = secret.grantRead(lambda);
            console.log('Assigning Access to Secret Manager: ',result);
        });
        
    }

}