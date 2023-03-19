import {
    TsgDynamoDbProp,
    TsgBundleProp,
} from "../types";
import { TsgLambdaLayerProp } from "../types/TsgLambdaLayerProp";

export interface ResourceAppConfig {
    BUNDLE?: TsgBundleProp[];
    DYNAMO?: TsgDynamoDbProp;
    LAMBDA_LAYERS?: TsgLambdaLayerProp[];
}