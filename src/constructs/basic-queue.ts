import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { createSQSResource } from "../resources/sqs/create-sqs-resource";

export class BasicQueue extends Construct {

  public readonly queue: IQueue;

  constructor(
    scope: Construct,
    id: string,
    props: { queueName: string },
    private env: string
  ) {
    super(scope, id);

    this.queue = createSQSResource(scope, props.queueName);    
  }
}