import { Code, LayerVersion, LayerVersionProps, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { TsgLambdaLayerProp } from "../../config/types/TsgLambdaLayerProp";
import { MicroserviceProps } from "../../interfaces/MicroserviceProps";
import * as path from "path";

export const createLambdaLayer = (scope: Construct, globalProps: MicroserviceProps, prop: TsgLambdaLayerProp) => {

    const propResult = createLambdaLayerProps(prop, globalProps);

    const layer = new LayerVersion(scope, `${globalProps.GLOBALS.name}-common-layer`, propResult);

    return layer;

};

const createLambdaLayerProps = (prop: TsgLambdaLayerProp, props: MicroserviceProps) => {

    const baseProps = baseLayerProps(props, prop.description);

    const baseLayer: LayerVersionProps = {
        ...baseProps,
        code: Code.fromAsset(path.join(prop.codePath),),
        description: prop.description,
        layerVersionName: `${prop.name}`
    };
    return baseLayer;
};

const baseLayerProps = (prop: MicroserviceProps, desc: string) => {

    const baseLayerProps: LayerVersionProps = {
        code: Code.fromAsset(path.join(''),),
        compatibleRuntimes: [prop.GLOBALS.stackRuntime],
        license: 'Apache-2.0',
        description: desc,
    };

    return baseLayerProps;
};