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

export class CreateDynamoSingleTableDesign extends Construct {
  public readonly createdResource: Table;
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

  constructor(
    scope: Construct,
    id: string,
    protected tableName: string,
  ) {
    super(scope, id);
    this.createdResource = this.createResource();
    this.createOutput();
  }

  protected createResource(): Table {
    const dbTable = new Table(this, "Table", {
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

  protected createOutput(): void {
    // Logical IDs must not include unresolved tokens; use a stable ID
    new CfnOutput(this, "TableOutput", {
      value: `Table Name: ${this.createdResource?.tableName}\t Table Arn: ${this.createdResource?.tableArn}`,
    });
  }
}
