import { AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { TsgDynamoIndex } from "./TsgDynamoIndex";

export interface TsgDynamoProp {

    tableName: string;
    primaryKey: {
        name: string;
        type: AttributeType;
    },
    sortKey?: {
        name: string;
        type: AttributeType;
    },
    billingMode: BillingMode;
    indexes: TsgDynamoIndex[],
}