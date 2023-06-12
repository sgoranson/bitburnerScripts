import * as ll from './lib.js';

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    ll.logConfig.ns = ns;

    if (ns.args.includes('--help')) {
        ns.tprint(`usage: ${ns.getScriptName()} exe ...args [--help]`);
    }

    const [exe, ...args] = ns.args;

    const hostname = ns.getHostname();
    const maxThreads = ll.calcScriptMaxThreads({ scriptName: exe, serverName: hostname });

    // eslint-disable-next-line quotes

    if (args.length > 0) {
        ns.exec(exe, hostname, maxThreads, ...args);
    } else {
        ns.exec(exe, hostname, maxThreads);
    }
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    return [...data.scripts];
}
