import * as express from "express";
import * as http from "http";
import { partial } from 'lodash';
import { applyCommandLineArgs, defaultArgs, getProxyOptions } from "./config/index";
import { setupAppMiddleware } from "./proxy/middleware";
import { consoleToTerminal } from "./plugins/index";
import { MYProxyPluginImpl, MYProxyPlugin } from "./interface/plugins";
import { MYProxy } from "./proxy/my-proxy";

const myProxyConfig = require("../myproxy.config.json");
const options = applyCommandLineArgs(
    getProxyOptions(myProxyConfig.target || "localhost", myProxyConfig.port || "8008"),
    defaultArgs,
);

const pluginsModule = require("./plugins/index");
const plugins: MYProxyPluginImpl[] = [];

const requiredPlugins = myProxyConfig.plugins;
if (requiredPlugins && requiredPlugins.length) {
    requiredPlugins.forEach(({ name: pluginName, options: pluginOptions }) => {
        // try to find local plugin
        let pluginImpl: MYProxyPluginImpl;
        for (const pluginModuleName in pluginsModule) {
            const localPlugin = pluginsModule[pluginModuleName] as MYProxyPlugin;
            if (pluginName === localPlugin.name) {
                pluginImpl = localPlugin.getPlugin(pluginOptions);
                break;
            }
        }

        // look for plugin in installed modules
        if (!pluginImpl) {
            try {
                const preinstalledPlugin = require(pluginName);
                pluginImpl = preinstalledPlugin.getPlugin(pluginOptions);
            } catch (e) {
                console.warn(`Unable to load plugin ${pluginName}`);
            }
        }

        if (pluginImpl) {
            plugins.push(pluginImpl);
        }
    });
}

plugins.forEach((plugin) => {
    if (plugin.initPlugin) {
        plugin.initPlugin(plugin.options);
    }
});

options.plugins = plugins;

const proxy = new MYProxy(options);
proxy.listen();
