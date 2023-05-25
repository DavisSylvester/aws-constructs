import { ApiAppConfig } from "../config/customConfigs/ApiAppConfig";
import { GlobalAppConfig } from "../config/customConfigs/GlobalAppConfig";
import { ResourceAppConfig } from "../config/customConfigs/ResourceAppConfig";
import { TsgDnsAppConfig } from "../config/types/TsgDnsConfig";

export interface MicroserviceProps {
    API: ApiAppConfig;
    GLOBALS: GlobalAppConfig;
    RESOURCES: ResourceAppConfig;
    DNS?: TsgDnsAppConfig;
}