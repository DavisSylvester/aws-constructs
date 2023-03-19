import { Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";

export abstract class BaseResource<T> {

    protected createdResources: T[];

    constructor(protected scope: Construct, protected config: AppConfig) { }

    protected abstract createResource(scope: Construct): T[] | null;
    
    protected abstract createOutput<T>(scope: Construct, createdAssets: T[]): void;
    
}