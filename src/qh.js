import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['targetServer'],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    ll.logConfig.ns = ns;

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()}  [--help]`);
    }
    /**@type {import(".").Server[]} */
    const servers = ll.treeScan(ns);
    const reqHackLevel = ns.getHackingLevel();

    const ezServers = servers
        .filter((s) => s.requiredHackingSkill <= reqHackLevel)
        .filter((s) => !s.purchasedByPlayer)
        // .filter((s) => s.numOpenPortsRequired <= progCount)
        .filter((s) => s.hostname !== 'darkweb')
        // .sort((a, b) => b.moneyMax - a.moneyMax);
        .sort((a, b) => b.moneyAvailable - a.moneyAvailable);

    const maxThreads = ll.calcScriptMaxThreads({ scriptName: 'hack.js', serverName: ns.getHostname() });
    ezServers
        .map((s) => {
            const earnable = s.moneyAvailable * ns.hackAnalyze(s.hostname) * maxThreads;
            const hackTimeSec = ns.getHackTime(s.hostname) / 1000;
            const earnableStr = ll.FMTN(earnable);
            const cashPerSec = earnable / hackTimeSec;
            const cashPerSecStr = ll.FMTN(cashPerSec);
            return { ...s, earnable, earnableStr, hackTimeSec, cashPerSec, cashPerSecStr };
        })
        .sort((a, b) => b.cashPerSec - a.cashPerSec)
        .forEach(({ hostname, earnable, earnableStr, cashPerSecStr }) =>
            ns.tprint({ hostname, earnable, earnableStr, cashPerSecStr })
        );
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
