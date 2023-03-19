import { Environment } from "../Environments";
import { TsgDnsAppConfig } from "../types/TsgDnsConfig";
import { ApiAppConfig } from "./ApiAppConfig";
import { GlobalAppConfig } from "./GlobalAppConfig";
import { ResourceAppConfig } from "./ResourceAppConfig";

export interface IAppConfig {
    
    GLOBALS: GlobalAppConfig;
    API?: ApiAppConfig;
    RESOURCES: ResourceAppConfig;
    DNS: TsgDnsAppConfig;
}