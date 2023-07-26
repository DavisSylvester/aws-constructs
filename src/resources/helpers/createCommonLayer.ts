import { Construct } from "constructs";
import { createLambdaLayer } from "../lambda-layer/createLambdaLayer";
import { TsgLambdaLayerProp } from "../../config/types/TsgLambdaLayerProp";
import { AppConfig } from "../../config/AppConfig";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";

export const createCommonLayer = (scope: Construct, appProps: AppConfig) => {

    const prop: TsgLambdaLayerProp = {
        description: appProps.RESOURCES.LAMBDA_LAYERS![0].description,
        codePath: appProps.RESOURCES.LAMBDA_LAYERS![0].codePath,
        name: appProps.RESOURCES.LAMBDA_LAYERS![0].name,
    };
    
    // LOOP OVER ALL LAMBDA LAYERS CREATE A RECORD<LAYER_NAME, LAYER_VERSION>
    const layerRecord: Record<string, LayerVersion>[] = [];

    const tempLayerNames = appProps.RESOURCES.LAMBDA_LAYERS?.map((x) => {

        if (x.name) {
            return x.name;
        }

        return;
    }) as string[];    

    const layerNames = [...tempLayerNames] as const;
    type LayerNames = typeof layerNames[number];
    const layer = createLambdaLayer(scope, appProps, prop);

    const lambdaLayers: Record<LayerNames, LayerVersion> = {
        [typeof layerNames]: layer,
    };

   

    return [layer];
};

const layerNames = ["davis", "joy", "camille", "collin"];


type LayerNames = typeof layerNames[number];