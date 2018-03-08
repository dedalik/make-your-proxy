import * as url from "url";
import { partial } from 'lodash';
import { compress, decompress } from "brotli";
import { ProxyOptions } from "../config/index";
import { HtmlMutationHandler, MYProxyPluginImpl } from "../interface/plugins";

const REDIRECT_HTTP_STATUS_CODES = [301, 302, 307, 308];
export function getProxyResHeaderDecorator(options: ProxyOptions) {
    return partial(proxyResponseHeadersDecorator, options);
}

export function getProxyResDecorator(options: ProxyOptions) {
    return partial(proxyResponseDecorator, options);
}

function proxyResponseHeadersDecorator(options, headers, userReq, userRes, proxyReq, proxyRes) {
    headers = handleRedirectResponse(options, headers, userRes);
    if (options.isSecure) {
        headers = handleSetSecureCookie(headers);
    }

    return headers;
}

function handleRedirectResponse(options, headers, res) {
    const { location } = headers;
    if (REDIRECT_HTTP_STATUS_CODES.includes(parseInt(res.statusCode, 10)) && location) {
        // headers.location = location.replace(/(https?\:\/\/)(.*?)(\/|\?|$)/, `$1${options.domain}$3`);
        const locationUrl = url.parse(location);
        if (locationUrl.hostname) {
            if (locationUrl.protocol === "https:") {
                locationUrl.protocol = "http:";
            }
            locationUrl.host = `localhost:${options.port}`;
        }
        headers.location = url.format(locationUrl);
    }
    return headers;
}

function handleSetSecureCookie(headers) {
    const cookie = headers["set-cookie"];
    if (cookie) {
        if (cookie instanceof Array) {
            headers["set-cookie"] = cookie.map(c => c.replace("Secure;", ""));
        } else {
            headers["set-cookie"] = cookie.replace("Secure;", "");
        }
    }

    return headers;
}

export function proxyResponseDecorator(options: ProxyOptions, proxyRes, proxyResData: Buffer, userReq, userRes) {
    proxyResData = handleHtmlResponseDecorator(
        proxyRes,
        proxyResData,
        userRes,
        options.plugins && options.plugins.filter(plugin => plugin.type === "HtmlMutator"),
    );
    return proxyResData;
}

function handleHtmlResponseDecorator(proxyRes, proxyResData: Buffer, userRes, mutators?: MYProxyPluginImpl[]) {
    if (!mutators) {
        return proxyResData;
    }

    const contentType = userRes.get('Content-Type');
    if (contentType && contentType.indexOf("html") !== -1) {
        let data = proxyResData;
        const encoding = proxyRes.headers["content-encoding"];
        if (encoding === "br") {
            data = Buffer.from(decompress(data));
        }
        let htmlData = mutators.reduce(
            (html, plugin) => (plugin.handler as HtmlMutationHandler)(html),
            data.toString(),
        );
        const output = Buffer.from(htmlData);
        return encoding === "br" ? Buffer.from(compress(output)) : output;
    } else {
        return proxyResData;
    }
}
