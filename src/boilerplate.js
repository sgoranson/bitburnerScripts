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

    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
