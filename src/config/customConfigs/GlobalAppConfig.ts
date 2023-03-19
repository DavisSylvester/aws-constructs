import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Environment } from "../Environments";
export interface GlobalAppConfig {

    
    name: string;
    accountNumber: string;
    region: string;
    stackRuntime: Runtime;
    prefix?: string;     
}