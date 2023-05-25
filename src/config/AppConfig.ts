import { config } from "process";
import { ApiAppConfig } from "./customConfigs/ApiAppConfig";
import { GlobalAppConfig } from "./customConfigs/GlobalAppConfig";
import { IAppConfig } from "./customConfigs/IAppConfig";
import { ResourceAppConfig } from "./customConfigs/ResourceAppConfig";
import { TsgDynamoProp } from "./types";
import { TsgDnsAppConfig } from "./types/TsgDnsConfig";
import { TsgLambdaName } from "./types/TsgLambdaName";
import { TsgLambdaProp } from "./types/TsgLambdaProp";

export class AppConfig implements IAppConfig {

    public API: ApiAppConfig;
    public GLOBALS: GlobalAppConfig;
    public RESOURCES: ResourceAppConfig;
    public DNS?: TsgDnsAppConfig;


    public lambdaConfigs: TsgLambdaProp[];
    public dynamoConfigs: TsgDynamoProp[];

    get AppName() {
        return this.GLOBALS.name;
    }

    get AppPrefix() {
        return (this.GLOBALS.prefix) ? this.GLOBALS.prefix : this.GLOBALS.name;
    }

    constructor(config: IAppConfig) {
        this.populate(config);
    }

    private populate(config: IAppConfig) {
        this.populateGlobalConfig(config);
        this.populateApiConfig(config);
        this.populateResources(config);


    }

    private populateGlobalConfig(config: IAppConfig) {
        this.GLOBALS = {
            ...config.GLOBALS
        };
    }

    private populateApiConfig(config: IAppConfig) {

        if (config.API)
            this.API = {
                ...config.API
            };
    }

    private populateResources(config: IAppConfig) {
        this.RESOURCES = {
            ...config.RESOURCES
        };
        this.RESOURCES.DYNAMO = {
            ...config.RESOURCES.DYNAMO
        };

        if (config.DNS) {
            this.DNS = {
                ...config.DNS!
            };
        }
    }
    //     this.lambdaConfigs = this.expandProps<TsgLambdaName, TsgLambdaProp>(this.RESOURCES.LAMBDA!);
    //     this.dynamoConfigs = this.expandProps<TsgTableName, TsgDynamoProp>(this.RESOURCES.DYNAMO?.TABLES!);
    // }

    private populateConfigs<T, R>(result: R[], record?: Record<string, R>) {

        if (!record) {
            return null;
        }

        result = this.expandProps<T, R>(record);
        return result;

    }

    private expandProps<T, R>(data: Record<string, R>) {

        const result = [];
        // @ts-ignore
        for (const [key, value] of Object.entries(data)) {
            result.push(value);
        }
        return result as R[];
    }
}