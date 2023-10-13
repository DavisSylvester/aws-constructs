import {
    TsgDynamoDbProp,
    TsgLambdaProp,
} from "../types";
import { TsgAuthorizerProp } from "../types/TsgAuthorizerProp";
import { TsgEC2Prop } from "../types/TsgEc2Prop";
import { TsgLambdaLayerProp } from "../types/TsgLambdaLayerProp";

export interface ResourceAppConfig {    
    DYNAMO?: TsgDynamoDbProp;
    LAMBDA_LAYERS?: TsgLambdaLayerProp[];
    AUTHORIZER?: TsgAuthorizerProp;
    LAMBDA: TsgLambdaProp[];
    EC2: TsgEC2Prop[];
    
}