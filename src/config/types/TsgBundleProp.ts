import { TsgLambdaLayerProp } from "./TsgLambdaLayerProp";
import { TsgLambdaProp } from "./TsgLambdaProp";


export interface TsgBundleProp
{
    version: string;
    AUTHORIZER?: TsgLambdaProp;
    LAMBDA: TsgLambdaProp[];
    
}