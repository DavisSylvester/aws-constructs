import { Construct } from "constructs";
import { TimerJobProps } from "../interfaces/timer-job";
import { createBasicLambdaTimerJob } from "../resources/lambda/create-basic-lambda";

export class TimerJob extends Construct {

    constructor(scope: Construct, id: string, props: TimerJobProps,
        private env: string) {

        super(scope, id);

        const createdLambda = createBasicLambdaTimerJob(scope, props);



    }
}