import * as httpProxy from "http-proxy";
import * as expressHttpProxy from "express-http-proxy";
import { globalAgent } from "https";
import { partial } from "lodash";
import { ProxyOptions } from "../config/index";
import * as express from "express";
import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import { getProxyResHeaderDecorator, getProxyResDecorator } from "./proxy-decorators";
import { setupAppMiddleware } from "./middleware";

export class MYProxy {
    private app: express.Express;
    private server: Server;
    private options: ProxyOptions;

    constructor(options: ProxyOptions) {
        this.options = options;

        this.app = express();
        setupAppMiddleware(this.app, options);
        
        this.server = createServer(this.app);
        this.attachProxy();
    }

    public listen() {
        const { port } = this.options;
        this.server.listen(port, () => console.log(`Listening at http://localhost:${port}`));
    }

    private attachProxy() {
        this.server.on("upgrade", this.proxyWsRequest());
        this.app.use(
            expressHttpProxy(this.options.domain, {
                userResHeaderDecorator: getProxyResHeaderDecorator(this.options),
                userResDecorator: getProxyResDecorator(this.options),
                https: this.options.isSecure,
            }),
        );
    }
    
    private proxyWsRequest() {
        const protocol = this.options.isSecure ? "wss" : "ws";
        const proxy = httpProxy.createProxyServer({
            target: `${protocol}://${this.options.domain}`,
            ws: true,
            changeOrigin: true,
            autoRewrite: true,
            secure: false,
        });
    
        const outputError = (msg, req, error) => {
            console.error(new Date().toString(), msg, req.url, error);
        }
    
        proxy.on("error", (error: any, req: any, res: any) => {
            if (error.syscall === "getaddrinfo") {
                outputError("WS: DNS lookup failed", req, error);
            } else if (error.code === "ECONNRESET") {
                outputError("WS: Connection closed unexpectedly", req, error);
            } else {
                outputError("WS: Proxy error", req, error);
            }
        });
    
        return (req, socket, head) => {
            req.headers.origin = this.options.domain;
            proxy.ws(req, socket, head);
        };
    }
}