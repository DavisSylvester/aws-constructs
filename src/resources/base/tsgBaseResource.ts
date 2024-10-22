import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";

export abstract class TsgBaseResource<T, R> {

    protected createdResource: T | null;

    constructor(protected scope: Construct, protected config: R) {

        this.createdResource = this.createResource(scope);

        if (this.createdResource) {
            this.createOutput(scope);
        }
    }


    protected abstract createResource(scope: Construct): T | null;

    protected abstract createOutput<T>(scope: Construct): void;

}