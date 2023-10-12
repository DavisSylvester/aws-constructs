import { TsgAuthorizerType } from "./TsgAuthorizerType";
import { TsgLambdaProp } from "./TsgLambdaProp";


export interface TsgAuthorizerProp extends TsgLambdaProp {

    type: TsgAuthorizerType;
    headerName?: string;
}