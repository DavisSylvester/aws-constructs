import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { GlobalSecondaryIndexProps,Table, TableProps } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { BaseResource } from "../base/baseResource";


export class CreateDynamoDb extends BaseResource<Table> {

    static ReadWriteActions: string[] = [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:ConditionCheckItem",
        "dynamodb:DeleteItem",
        "dynamodb:DescribeTable",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
    ];

    get CreatedTables() {
        return this.createdResources;
    }
    
    constructor(protected scope: Construct, protected config: AppConfig) {
        super(scope, config);

        this.createdResources = this.createResource(scope);

        if (this.createdResources) {
            this.createOutput(scope, this.createdResources);
        }
    }

    protected createResource(scope: Construct): Table[] {
        
            const props = this.createProps();

            const tables = props?.map((prop: any, idx: number) => {
                const dbTable = new Table(scope, `${prop.tableName}`, {
                    ...prop,
                    removalPolicy: RemovalPolicy.DESTROY,
                    
                });

                

                this.config.RESOURCES.DYNAMO?.TABLES?.[idx].indexes.map((gsi) => {

                    const gsiProps: GlobalSecondaryIndexProps = {
                        indexName: gsi.indexName,
                        partitionKey: gsi.partitionKey,
                        sortKey: gsi.sortKey,
                        projectionType: gsi.projectionType

                    };

                    dbTable.addGlobalSecondaryIndex(gsiProps);
                });
                return dbTable;
            });

            return tables ?? [];
       

       
    }


    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {
        this.createdResources!.forEach((x, idx) => {
            new CfnOutput(scope, `dynamoTable${idx}`, {
                value: x.tableName
            });
        });
    }

    private createProps() {
        const props = this.config.RESOURCES?.DYNAMO?.TABLES?.map((x) => {

            const prop: any = {};

            prop.tableName = this.generateDbName(x.tableName);
                        
            prop.partitionKey = {
                name: x.primaryKey.name,
                type: x.primaryKey.type
            };

            prop.billingMode = x.billingMode;

            if (x.sortKey) {
                prop.sortKey = {
                    name: x.sortKey.name,
                    type: x.sortKey.type,
                }
            }
            return prop as TableProps;
        });

        return props;
    }

    private generateDbName(tableName: string) {
        return `${this.config.AppPrefix}-${tableName}`;
    }
}