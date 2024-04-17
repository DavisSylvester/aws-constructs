import { CfnOutput, RemovalPolicy, Tag } from "aws-cdk-lib";
import { BasePathMapping, Cors, CorsOptions, DomainName, EndpointType, IDomainName, IRestApi, MethodOptions, RestApi, RestApiProps, SecurityPolicy } from "aws-cdk-lib/aws-apigateway";
import { ARecord, CnameRecord, HostedZone, IHostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGateway, ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";

import { BaseResource } from "../base/baseResource";
import { CreateCertificate } from "../certificate/createCertificate";
import { TsgApiKey } from "./createApiKey";


export class Api extends BaseResource<IRestApi> {

    private corsOptions: CorsOptions;


    get APIs() {
        return this.createdResources;
    }

    constructor(scope: Construct, config: AppConfig, private env: string) {
        super(scope, config);

        this.corsOptions = this.createDefaultCorsOptions();

        this.createdResources = this.createResource(scope);
    }

    private createApi(scope: Construct, env: string) {
        if (this.config.DNS) {

            // console.log('### DNS is true ###');

            const zone = this.getZone(this.scope, this.config);

            const api = new RestApi(this.scope, `${this.config.AppPrefix}-rest-api`, this.createApiProps(env, zone));

            this.createARecord(scope, zone, api);

            // this.createCnameRecord(scope, zone, api, this.config);

            this.createApiKey(this.config, api);

            return api;

        } else {

            const api = new RestApi(this.scope, `${this.config.AppPrefix}-rest-api-without-DNS`, this.createApiProps(env));

            this.createApiKey(this.config, api);

            return api;
        }
    }

    private createApiProps(env: string, zone?: IHostedZone): RestApiProps {

        if (this.config.DNS) {

            const cert = this.createCertificate(this.scope, zone!, this.config, env);

            const props: RestApiProps = {
                restApiName: `${this.config.AppPrefix}-${this.config.API.Name}`,
                description: this.config.API.Description,
                domainName: {
                    domainName: `${this.config.API.DomainPrefix}.${env}.${this.config.DNS.ZoneName}`,
                    certificate: cert.certificate,
                    endpointType: EndpointType.REGIONAL,
                    securityPolicy: SecurityPolicy.TLS_1_2
                },
                defaultCorsPreflightOptions: this.corsOptions
            };

            return props;
        } else {
            const props: RestApiProps = {
                restApiName: `${this.config.AppPrefix}-${this.config.API.Name}`,
                description: this.config.API.Description,
                defaultCorsPreflightOptions: this.corsOptions
            };

            return props;
        }
    }

    private createDefaultCorsOptions() {

        const corsOptions: CorsOptions = {
            allowHeaders: [
                '*',
            ],
            allowMethods: Cors.ALL_METHODS,
            allowCredentials: true,
            allowOrigins: Cors.ALL_ORIGINS,
        };

        return corsOptions;
    }

    private requiresApiKey(config: AppConfig) {
        // Determine if any of the lambdas require an API Key
        return config.RESOURCES.LAMBDA.some((lambda) => lambda.apiGateway?.requireApiKey === true);
    }

    private createApiKey(config: AppConfig, api: RestApi) {

        if (this.requiresApiKey(this.config)) {
            const apiKey = new TsgApiKey(this.scope, this.config, api)
            return apiKey;
        }
        return null;
    }

    private getZone(scope: Construct, config: MicroserviceProps) {
        return HostedZone.fromHostedZoneAttributes(scope, `${config.DNS?.ZoneName}-zone`, {
            zoneName: config.DNS?.ZoneName!,
            hostedZoneId: config.DNS?.ZoneId!
        });
    }

    private createCertificate(scope: Construct, zone: IHostedZone, config: MicroserviceProps,
        env: string) {
        const cert = new CreateCertificate(scope, config, zone, env);

        cert.certificate.applyRemovalPolicy(RemovalPolicy.DESTROY);
        return cert;
    }

    private createARecord(scope: Construct, zone: IHostedZone, api: RestApi) {
        const aRecord = new ARecord(scope, `api-dns-a-record-${this.config.API.DomainPrefix}`, {
            zone,
            target: RecordTarget.fromAlias(new ApiGateway(api)),
            recordName: `${this.config.API.DomainPrefix}.${this.env}.${this.config.DNS?.ZoneName}`
        });

        aRecord.applyRemovalPolicy(RemovalPolicy.DESTROY);
        return aRecord;
    }

    private createCnameRecord(scope: Construct, zone: IHostedZone, api: RestApi, config: AppConfig) {
        const record = new CnameRecord(scope, "api-cname-record", {
            zone,
            domainName: api.domainName?.domainNameAliasDomainName!,
            recordName: `${config?.DNS?.SubDomainNameForApi}.${config?.DNS?.SubDomainName}`
        });
        return record;
    }

    protected createResource(scope: Construct) {

        const api = this.createApi(scope, this.env);
        // TODO:  ONLY IF CUSTOM MAPPING IS REQUIRED
        // const domain = this.createCustomDomain(scope, this.config);

        // const mapping = this.attachDomainToApi(scope, api, domain, this.config);



        return [api];
    }

    protected createOutput<T>(scope: Construct, createdAssets: T[]): void {
        createdAssets.forEach((api, idx) => {

            new CfnOutput(scope, `api${idx}`, {
                // @ts-ignore
                value: api.url
            });
        });
    }

}