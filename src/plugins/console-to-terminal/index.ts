import { HtmlMutationHandler } from "../../interface/plugins";
const consoleToTerminal = require("console-to-terminal");

let app: any;
let host: string;
let port: string;
export const initConsoleToTerminal = (options: any) => {
    ({ host = "localhost", port = "8765" } = options);
    app = consoleToTerminal(host, port);
};

export const injectConsoleHook: HtmlMutationHandler = (rawHtml: string): string => {
    return rawHtml.replace("<head>", `<head><script src="http://${host}:${port}/console-hook.js"></script>`);
};
