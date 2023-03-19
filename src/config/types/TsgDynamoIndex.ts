import { AttributeType, ProjectionType } from "aws-cdk-lib/aws-dynamodb";

export interface TsgDynamoIndex {

    indexName: string;
    partitionKey: {
        name: string;
        type: AttributeType
    },
    sortKey?: {
        name: string;
        type: AttributeType
    } 
    projectionType: ProjectionType;

}