import { Construct } from "constructs";
import { createLambdaLayer } from "../lambda-layer/createLambdaLayer";
import { TsgLambdaLayerProp } from "../../config/types/TsgLambdaLayerProp";
import { AppConfig } from "../../config/AppConfig";

export const createCommonLayer = (scope: Construct, appProps: AppConfig) => {

    const prop: TsgLambdaLayerProp = {
        description: appProps.RESOURCES.LAMBDA_LAYERS![0].description,
        codePath: appProps.RESOURCES.LAMBDA_LAYERS![0].codePath,
        name: appProps.RESOURCES.LAMBDA_LAYERS![0].name,
    };  
    
    const layer = createLambdaLayer(scope, appProps, prop)
    
    return [layer];
};

