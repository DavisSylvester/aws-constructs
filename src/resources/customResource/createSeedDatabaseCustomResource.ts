import { ITableV2 } from "aws-cdk-lib/aws-dynamodb";
import { LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { LambdaHelper } from "../lambda/lambdaHelper";
import { Provider, ProviderProps } from "aws-cdk-lib/custom-resources";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { CustomResource, CustomResourceProps } from "aws-cdk-lib";


export const createSeedDatabaseCustomResource = (scope: Construct, config: AppConfig, 
    database: ITableV2, layers?: LayerVersion[]) => {

        const seedLambda = config.RESOURCES.DYNAMO?.SEED_LAMBDA;

        const databaseSeedLambda = LambdaHelper.createLambdaFunctions(scope, 
            config, 
            seedLambda!, 
            undefined, 
            layers!) as NodejsFunction;
    // const databaseSeedLambda = new NodejsFunction(scope, `${config.AppPrefix}-database-seed-cr`, {
    //     runtime: Runtime.NODEJS_LATEST,
    //     handler: seedLambda?.handler,
    //     entry: path.resolve(seedLambda?.codePath!),
    //     environment: {
    //         ...seedLambda?.environment
    //     },
    //     layers
    // });

    database.grantReadWriteData(databaseSeedLambda);

    const providerProps: ProviderProps = {
        onEventHandler: databaseSeedLambda,
      logRetention: RetentionDays.ONE_WEEK,
    };

    const provider = new Provider(scope, `${config.AppPrefix}-database-seed-provider`, providerProps);

    const crProps: CustomResourceProps = {
        serviceToken: provider.serviceToken,
    };

    new CustomResource(scope, `${config.AppPrefix}-database-seed`, crProps);
};