import { HtmlMutationHandler } from "../../interface/plugins";
const consoleToTerminal = require("console-to-terminal");

let app: any;
let host: string;
let port: string;
let xhr: boolean;
export const initConsoleToTerminal = (options?: any) => {
    host = options && options.host || "localhost";
    port = options && options.port || "8765";
    xhr = options && options.xhr;
    app = consoleToTerminal(host, port, xhr);
};

export const injectConsoleHook: HtmlMutationHandler = (rawHtml: string): string => {
    return rawHtml.replace("<head>", `<head><script src="http://${host}:${port}/console-hook.js"></script>`);
};
