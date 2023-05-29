export interface TsgLambdaRoutable {
    route: string;
    secure?: boolean;
    method?: "get" | "post" | "delete" | "put" | "patch";
    version?: number;
    useRouteOverride?: boolean;
}