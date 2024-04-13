import { debug } from "console";

export class Logger {

    constructor(private debug: boolean = false) { }

    public log(message: string) {

        if (this.debug) {
            console.log(message);
        }

    }
}