
const schema = [['help', false]];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME [--help]`);
        return;
    }

    ns.tail();

    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
