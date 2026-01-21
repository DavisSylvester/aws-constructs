import { Construct } from "constructs";
import { CreateDynamoSingleTableDesign } from "../resources/dynamodb/CreateDynamoSingleTableDesign";

export class DynamoDbSingleTable extends Construct {
  constructor(scope: Construct, id: string, tableName: string) {
    super(scope, id);
    new CreateDynamoSingleTableDesign(this, id, tableName);
  }
}
