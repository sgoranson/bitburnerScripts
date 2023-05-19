import * as ll from '/bb/lib.js';

const schema = [
    ['help', false], //
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    ll.logConfig.ns = ns;
    console.log('opts :>> ', opts);

    if (opts.help || ns.args.length < 2) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME script [--help]`);
        return;
    }

    ns.exec(ns.args[1], ns.args[0]);
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
