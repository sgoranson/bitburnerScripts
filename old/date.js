import * as ll from '/bb/lib.js';

const schema = [
    ['help', false], //
    ['targetServer'],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    console.log('opts :>> ', opts);

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} --targetServer SERVERNAME [--help]`);
        return;
    }

    const dd = new Date();
    const dd2 = new Date();
    dd.setSeconds(dd.getSeconds() + 60);
    ns.tprint(
        `${ll.Color.cyan} [${dd2.toLocaleTimeString()}] ${ll.Color.white} ${dd.toLocaleTimeString()} ${ll.Color.reset}`
    );
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
