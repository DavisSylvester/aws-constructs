import { Construct } from "constructs";
import { TimerJobProps } from "../interfaces/timer-job";
import { createBasicLambdaTimerJob } from "../resources/lambda/create-basic-lambda.js";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class TimerJob extends Construct {
  public readonly lambdaFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props: TimerJobProps,
    private env: string
  ) {
    super(scope, id);

    this.lambdaFunction = createBasicLambdaTimerJob(scope, props);
  }
}
