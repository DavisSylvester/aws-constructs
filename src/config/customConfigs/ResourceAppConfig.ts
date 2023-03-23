import {
    TsgDynamoDbProp,
    TsgLambdaProp,
} from "../types";
import { TsgLambdaLayerProp } from "../types/TsgLambdaLayerProp";

export interface ResourceAppConfig {    
    DYNAMO?: TsgDynamoDbProp;
    LAMBDA_LAYERS?: TsgLambdaLayerProp[];
    AUTHORIZER?: TsgLambdaProp;
    LAMBDA: TsgLambdaProp[];
}