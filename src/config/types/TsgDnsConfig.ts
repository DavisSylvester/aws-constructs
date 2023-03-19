export interface TsgDnsAppConfig {
    ZoneName: string;
    ZoneNameWithoutSuffix: string;
    ZoneNameWithoutPeriod: string;
    HostName: string;
    FQDN: string;
    ZoneExist: boolean;
    ZoneId?: string;
}