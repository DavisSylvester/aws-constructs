import { CronOptions } from "aws-cdk-lib/aws-events/lib/schedule";
import { LambdaProps } from "../lambda";

export interface TimerJobProps extends LambdaProps {
  cronOptions: CronOptions;
}
