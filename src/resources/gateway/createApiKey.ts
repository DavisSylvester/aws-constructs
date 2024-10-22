import { Construct } from "constructs";
import { BaseResource } from "../base/baseResource";
import { ApiKeyProps, IApiKey, ApiKey as AWS_API_KEY, IRestApi, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AppConfig } from "../../config/AppConfig";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { UsagePlanProps } from "aws-cdk-lib/aws-apigateway";

export class TsgApiKey extends BaseResource<AWS_API_KEY> {


    private api: RestApi;    
    private apiKey: IApiKey;

    constructor(scope: Construct, config: AppConfig, api: RestApi) {
        super(scope, config);

        this.api = api;       

        this.createdResources = this.createResource(scope);

        this.applyRemovalPolicy();

        this.createOutput(scope, this.createdResources);
    }

    get APIKey() {
        return this.apiKey;
    }

    public createResource(scope: Construct): AWS_API_KEY[] {

        const keyProps: ApiKeyProps = {
            apiKeyName: `${this.config.AppPrefix}-x-api-key`,
            resources: [this.api],
            value: `ddGTsLQrae2U6zTEjw4M07qO4pHGt60u73zImLHE`,
            enabled: true,
            description: `API App Key for ${this.config.AppName}`,

        };

        const apiKey = new AWS_API_KEY(scope, `${this.config.AppPrefix}-api-key`, keyProps);

        this.createUsagePlan(scope, this.config, this.api, apiKey);

        return [apiKey];
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {
        this.createdResources.forEach((key, idx) => {

            new CfnOutput(scope, `api-key-${idx}`, {
                value: `${key.keyId}\t${key.keyArn}`
            });
        });
    }

    private applyRemovalPolicy() {

        const apiKey = this.createdResources[0];

        if (apiKey) {
            apiKey.applyRemovalPolicy(RemovalPolicy.DESTROY);
        }
    }

    private createUsagePlan(scope: Construct, config: AppConfig, api: RestApi, apiKey: AWS_API_KEY) {

        const planProps: UsagePlanProps = {
            name: `${config.AppName}-easy-plan`,
            throttle: {
                rateLimit: 1000,
                burstLimit: 10,
            },
            apiStages: [
                {
                    api: api,
                    stage: api.deploymentStage,
                },
            ],
        };

        const plan = api.addUsagePlan(
            `${config.AppPrefix}-${config.AppName}-usage-plan`,
            planProps
        );

        plan.addApiKey(apiKey);
    }
}