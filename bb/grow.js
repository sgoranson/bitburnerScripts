const schema = [
    ['help', false], //
    ['targetServer', ''],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    if (opts.help || ns.args.length < 2) {
        ns.tprint(`usage: ${ns.getScriptName()} --targetServer SERVERNAME [--help]`);
        return;
    }

    ns.tail();
    const startTime = new Date();
    ns.print(`startTime: ${startTime}`);
    const multipier = await ns.grow(opts.targetServer);
    const endTime = new Date();
    ns.print(`endTime: ${endTime}`);
    ns.print(`multiplier: ${multipier} elapsedSec: ${(endTime - startTime) / 1000}`);
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
