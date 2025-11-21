import { Construct } from "constructs";
import { LambdaProps } from "../interfaces/lambda";
import { createBasicLambda } from "../resources/lambda/create-basic-lambda-helper.js";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class BasicLambda extends Construct {
  public readonly lambdaFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props: LambdaProps,
    private env: string
  ) {
    super(scope, id);

    this.lambdaFunction = createBasicLambda(scope, props);
  }
}
