import { MicroserviceProps } from "../interfaces/MicroserviceProps";
import { AppConfig } from "./AppConfig";

export class MicroServiceAppConfig extends AppConfig {

   constructor(config: MicroserviceProps) {
       super(config);
   }
}