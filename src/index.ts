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
const requiredPluginNames = requiredPlugins.map(entry => entry.name);

for (const pluginModuleName in pluginsModule) {
    const plugin = pluginsModule[pluginModuleName] as MYProxyPlugin;
    const pluginIndex = requiredPluginNames.indexOf(plugin.name);
    if (pluginIndex > -1) {
        plugins.push(
            plugin.getPlugin(requiredPlugins[pluginIndex].options),
        );
    }
}

plugins.forEach((plugin) => {
    if (plugin.initPlugin) {
        plugin.initPlugin(plugin.options);
    }
});

options.plugins = plugins;

const proxy = new MYProxy(options);
proxy.listen();
