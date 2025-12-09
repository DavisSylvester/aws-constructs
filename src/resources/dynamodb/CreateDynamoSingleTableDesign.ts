import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  GlobalSecondaryIndexProps,
  ProjectionType,
  Table,
  TableProps,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { TsgBaseResource } from "../base/tsgBaseResource";

export class CreateDynamoSingleTableDesign extends TsgBaseResource<
  Table,
  string
> {
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

  get CreatedTable() {
    return this.createdResource;
  }

  constructor(protected scope: Construct, protected tableName: string) {
    super(scope, tableName);
  }

  protected createResource(scope: Construct): Table {
    const dbTable = new Table(scope, `${this.tableName}`, {
      tableName: this.tableName,
      removalPolicy: RemovalPolicy.DESTROY,

      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const gsiIndexes = [
      {
        indexName: "gsi1Index",
        partitionKey: {
          name: "gsi1pk",
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "gsi1sk",
          type: AttributeType.STRING,
        },
        projectionType: ProjectionType.ALL,
      },
      {
        indexName: "gsi2Index",
        partitionKey: {
          name: "gsi2pk",
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "gsi2sk",
          type: AttributeType.STRING,
        },
        projectionType: ProjectionType.ALL,
      },
      {
        indexName: "gsi3Index",
        partitionKey: {
          name: "gsi3pk",
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "gsi3sk",
          type: AttributeType.STRING,
        },
        projectionType: ProjectionType.ALL,
      },
    ];

    gsiIndexes.map((gsi) => {
      const gsiProps: GlobalSecondaryIndexProps = {
        indexName: gsi.indexName,
        partitionKey: gsi.partitionKey,
        sortKey: gsi.sortKey,
        projectionType: gsi.projectionType,
      };

      dbTable.addGlobalSecondaryIndex(gsiProps);
    });

    return dbTable;
  }

  protected createOutput<T>(scope: Construct): void {
    // Logical IDs must not include unresolved tokens; use a stable ID
    new CfnOutput(scope, "dynamoTable", {
      value: `Table Name: ${this.createdResource?.tableName}\t Table Arn: ${this.createdResource?.tableArn}`,
    });
  }
}
