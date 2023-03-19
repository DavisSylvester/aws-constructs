import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { Effect, PolicyDocument, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { MicroserviceProps } from "../../../../interfaces/MicroserviceProps";


export const cognitoPolicyDocument = (userPool: IUserPool, config: MicroserviceProps) => {

  const cpd: PolicyDocument = new PolicyDocument({

    statements: [
      new PolicyStatement({
        resources: [userPool.userPoolArn],
        actions: [
          "cognito:*",
          "cognito-idp:ListUsers"
        ],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
        ],
        resources: ["*"]
      }),
      new PolicyStatement({
        resources: [`arn:aws:dynamodb:${config.GLOBALS.region}:${config.GLOBALS.accountNumber}:table/*`],
        actions: [
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

        ],
        effect: Effect.ALLOW,
      }),
    ],
  });

  return cpd;
};