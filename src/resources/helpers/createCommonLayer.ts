import { Construct } from "constructs";
import { createLambdaLayer } from "../lambda-layer/createLambdaLayer";
import { TsgLambdaLayerProp } from "../../config/types/TsgLambdaLayerProp";
import { AppConfig } from "../../config/AppConfig";

export const createCommonLayer = (scope: Construct, appProps: AppConfig) => {

    const prop: TsgLambdaLayerProp = {
        description: 'Gravystack Common layer',
        codePath: './node_modules/@gravystack/gs-cdk-constructs/dist',
        name: 'gravystack-common-layer'
    };  
    
    const layer = createLambdaLayer(scope, appProps, prop)
    
    return layer;
};

