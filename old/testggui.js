import * as ll from '/bb/lib.js';

const schema = [
    ['help', false], //
    ['targetServer'],
    ['scripts'],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    console.log('opts :>> ', opts);

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} --targetServer SERVERNAME [--scripts xxx] [--help]`);
        return;
    }

    const log = (s) => {
        ns.print(
            `${ll.Color.cyan} [${new Date().toLocaleTimeString()}] ${ll.Color.white} ${s} sec left ${ll.Color.reset}`
        );
    };

    const PORTNUM = 1;
    const ph = ns.getPortHandle(PORTNUM);

    const lazydb = JSON.parse(ph.read());
    lazydb.servers = opts.targetServer;
    if (opts.scripts) {
        lazydb.scripts = opts.scripts;
    }
    ph.write(JSON.stringify(lazydb));

    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
