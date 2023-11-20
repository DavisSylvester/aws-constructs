import { Construct } from "constructs";
import { AppConfig } from "../config/AppConfig";

export interface BaseResourceProps {
    scope: Construct;
    config: AppConfig
}