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
import { RemovalPolicy, Stack } from "aws-cdk-lib";
import { CreateDynamoDb } from "../dynamodb/CreateDynamo";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";

import { ServiceBundleConfig } from "../../config/ServiceBundleConfig";

export class CreateMicroServiceBundle {
    
    protected readonly requireDynamoTableRefs: boolean;
    protected readonly requireAuthorizer: boolean;

    constructor(private serviceBundleConfig: ServiceBundleConfig) {
        
        this.requireDynamoTableRefs = (this.serviceBundleConfig.props.RESOURCES.DYNAMO?.TABLE_REFS?.length ?? 0 > 0) ? true : false;
        this.requireAuthorizer = (this.serviceBundleConfig.props.RESOURCES.AUTHORIZER) ? true : false;
        this.onInit(this.serviceBundleConfig.scope);
    }

    private onInit(scope: Construct) {

        
        let authorizer: TokenAuthorizer|undefined = undefined;

        // Create Authorizer
        if (this.requireAuthorizer) {
            authorizer = new CreateAuthorizer(scope, this.serviceBundleConfig.appConfig, this.serviceBundleConfig.props.RESOURCES.AUTHORIZER!).JwtAuthorizer;
            authorizer._attachToApi(this.serviceBundleConfig.gatewayApi);   
            authorizer.applyRemovalPolicy(RemovalPolicy.DESTROY);
        }        

        // Create Lambdas
        const lambdaProp: TsgLambdaProps = {
            scope,
            prop: this.serviceBundleConfig.props,            
            layers: this.serviceBundleConfig.layers,
            appConfig: this.serviceBundleConfig.appConfig
        };

        const lambdas = new CreateLambda(lambdaProp, this.serviceBundleConfig.appConfig);

        if (this.serviceBundleConfig.tables) {
            this.AssignAccessToTables(this.serviceBundleConfig.tables, lambdas.Lambdas);
        }        

        // Allow access to existing tables
        // if (this.requireDynamoTableRefs) {
        //     this.AssignAccessToTableRefs(scope, this.props.RESOURCES.DYNAMO?.TABLE_REFS, lambdas.Lambdas);
        // }

        if (this.serviceBundleConfig.secretMgr) {
            this.AssignAccessToSecretManager(this.serviceBundleConfig.secretMgr, lambdas.Lambdas);
        }        

        // lambdas.Lambdas.map((lambda) => {
        //     lambda.metricErrors({                
        //             label: `${lambda.functionName}-errors`, 
        //             period: Duration.minutes(3)           
                
        //     })
        // });

        this.AddRoutes(this.serviceBundleConfig.props, this.serviceBundleConfig.gatewayApi, lambdas.Lambdas, authorizer);
    }

    private AssignAccessToTables(tables: Table[], lambdas: NodejsFunction[]) {

        if (tables) {
            lambdas.forEach((lambda: NodejsFunction) => {
            
                tables.forEach((table: ITable) => {

                

                    //  This is a CDK bug: It doesn't provide
                    //  access to the indexes.
                    //table.grantReadWriteData(lambda);

                    //  Workaround:
                    // lambda.addToRolePolicy(
                    //     new PolicyStatement({
                    //         effect: Effect.ALLOW,
                    //         actions: CreateDynamoDb.ReadWriteActions,
                    //         resources: [
                    //             table.tableArn,
                    //             `${table.tableArn}/*`, // This is not recognized by cdk, but table is.  why?
                    //         ],
                    //     })
                    // );

                    table.grantReadWriteData(lambda);
                    
                    
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

        props.RESOURCES.LAMBDA?.forEach((prop: TsgLambdaProp) => {

            const lambdaId = CreateLambda.getIdForLambda(prop, this.serviceBundleConfig.appConfig);

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

    private AssignAccessToSecretManager(secret: ISecret, lambdas: NodejsFunction[]) {

        lambdas.forEach((lambda) => {
            const result = secret.grantRead(lambda);
            
        });
        
    }

}