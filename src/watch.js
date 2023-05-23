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
        ns.tprint(`usage: ${ns.getScriptName()} [server]  [--help]`);
    }

    ns.tail();
    const hostname = ns.args[0] ?? ns.getHostname();

    while (true) {
        ns.clearLog();
        ns.ps(hostname).forEach((p) => {
            ns.print(`${p.filename} ${p.args.join(' ')}\n`);
        });

        // eslint-disable-next-line no-await-in-loop
        await ns.sleep(1000);
    }
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
