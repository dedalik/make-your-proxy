import * as yargs from "yargs";
import { MYProxyPluginImpl } from "../interface/plugins";

export interface CommandLineArgs {
    key: string;
    options: yargs.Options;
}

export interface ProxyOptions {
    target: string;
    domain: string;
    port: number;
    isSecure: boolean;
    plugins?: MYProxyPluginImpl[];
}

export const defaultArgs: CommandLineArgs[] = [
    {
        key: "target",
        options: {
            alias: "t",
            type: "string",
            desc: "Host for proxying to",
        },
    },
    {
        key: "port",
        options: {
            alias: "p",
            type: "number",
            desc: "Port for proxy to listen",
        },
    },
];

export function getProxyOptions(target, port): ProxyOptions {
    const matches = target.match(/(http(s?):\/\/)?(.*?)(\/|$)/);
    const domain = matches[3];
    const isSecure = matches[2] === "s";
    return {
        target,
        port,
        domain,
        isSecure,
    };
}

export function applyCommandLineArgs(options: ProxyOptions, clArgs: CommandLineArgs[]): ProxyOptions {
    let args = yargs;
    clArgs.forEach(({key, options}) => args = args.option(key, options));

    const { target, port } = args.argv;
    return getProxyOptions(target || options.target, port || options.port);
}
