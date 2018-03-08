import { Request, Response } from "express";

export type PluginType = "HtmlMutator" | "RequestMiddleware";
export type PluginHandlerType = HtmlMutationHandler | RequestMiddlewareHandler;

export interface MYProxyPlugin {
    name: string;
    getPlugin: (options?: any) => MYProxyPluginImpl,
}

export interface MYProxyPluginImpl {
    type: PluginType;
    handler: PluginHandlerType;
    initPlugin?: (options?: any) => void;
    options?: any;
}

export type HtmlMutationHandler = (rawHtml: string) => string;
export type RequestMiddlewareHandler = (req: Request, res: Response, next: (...rest: any[]) => void) => void;
