import { TsgDynamoProp } from "./TsgDynamoProp";
import { TsgDynamoTableRef } from "./TsgDynamoTableRef";

export interface TsgDynamoDbProp {
    TABLE_REFS?: TsgDynamoTableRef[];
    TABLES?: TsgDynamoProp[];
}