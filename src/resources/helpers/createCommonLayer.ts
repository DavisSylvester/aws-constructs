import { Construct } from "constructs";
import { createLambdaLayer } from "../lambda-layer/createLambdaLayer";
import { TsgLambdaLayerProp } from "../../config/types/TsgLambdaLayerProp";
import { AppConfig } from "../../config/AppConfig";

export const createCommonLayer = (scope: Construct, appProps: AppConfig) => {

    const prop: TsgLambdaLayerProp = {
        description: 'Common Lambda layer',
        codePath: './node_modules/@davissylvester/bishop-cdk-constructs/dist',
        name: 'bishop-common-layer'
    };  
    
    const layer = createLambdaLayer(scope, appProps, prop)
    
    return [layer];
};

