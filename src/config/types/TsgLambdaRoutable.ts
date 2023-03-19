export interface TsgLambdaRoutable {
    route: string;
    secure?: boolean;
    method?: "get" | "post" | "delete" | "put" | "patch";
}