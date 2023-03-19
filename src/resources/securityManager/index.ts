import { SecretValue } from "aws-cdk-lib";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";

export const createSecretManager = (scope: Construct) => {

  const secureMgr = new Secret(scope, 'TemplatedSecret', {
    secretName: 'GITHUB_TOKEN',
    secretStringValue: SecretValue.unsafePlainText(process.env.GITHUB_TOKEN!),
  });



};

export const getSecretManager = (scope: Construct, prop: MicroserviceProps,
  secretManagerARN: string) => {

  const secretMgr = Secret.fromSecretCompleteArn(scope, `${prop.GLOBALS.name}-secret-manager`,
    secretManagerARN);

  return secretMgr;
};