import { ILoggerContext } from "./IContext";

export function logger(context: ILoggerContext) {

    const showLogs = Boolean(process.env.VERBOSE_LOGGING || false);

    if (showLogs) {
        console.log(`### ${(context.functionName) ? `${context.functionName} ::  ` : ''} ${(context.name) ? `${context.name} ::  ` : ''}  ${(context.message) ? `${context.message} ::  ` : ''}`);
    }
    // ### run() :: 
}