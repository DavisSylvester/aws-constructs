import { CronOptions } from "aws-cdk-lib/aws-events/lib/schedule";
import { IRole } from "aws-cdk-lib/aws-iam/lib";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { LambdaProps } from "../lambda";

export interface TimerJobProps extends LambdaProps {    
        
    cronOptions: CronOptions;
    
}