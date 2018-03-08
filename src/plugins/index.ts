import { MYProxyPlugin } from "../interface/plugins";
import { initConsoleToTerminal, injectConsoleHook } from "./console-to-terminal/index";

export const consoleToTerminal = {
    name: "console-to-terminal",
    getPlugin: (options) => ({
        initPlugin: initConsoleToTerminal,
        type: "HtmlMutator",
        handler: injectConsoleHook,
        options,
    }),
};
