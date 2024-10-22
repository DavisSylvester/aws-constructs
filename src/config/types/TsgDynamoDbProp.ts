import { TsgDynamoProp } from "./TsgDynamoProp";
import { TsgDynamoTableRef } from "./TsgDynamoTableRef";
import { TsgLambdaProp } from "./TsgLambdaProp";

export interface TsgDynamoDbProp {
    TABLE_REFS?: TsgDynamoTableRef[];
    TABLES?: TsgDynamoProp[];
    USE_SEED_DATABASE?: boolean;
    SEED_LAMBDA?: TsgLambdaProp;
}