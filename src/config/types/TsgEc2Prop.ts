import { TsgKeyPair } from "./TsgKeyPair";

export interface TsgEC2Prop {
    VpcId: string;
    MachineImage: string;
    Region: string;
    KeyPair: TsgKeyPair; 

}