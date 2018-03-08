import { Express, Request, Response } from "express";
import { partial } from 'lodash';
import { ProxyOptions } from "../config/index";

function addCorsHeaders(
    req: Request,
    res: Response,
    next: () => void,
) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

function restoreSecureCookie(
    options: ProxyOptions,
    req: Request,
    res: Response,
    next: () => void,
) {
    if (options.isSecure && req.headers.cookie) {
        req.headers.cookie += "; Secure;";
    }
    next();
}

export function setupAppMiddleware(app: Express, options: ProxyOptions) {
    app.use(
        addCorsHeaders,
        partial(restoreSecureCookie, options),
    );
}
