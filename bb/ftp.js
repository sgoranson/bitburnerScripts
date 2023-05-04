/** @param {NS} ns */

export async function main(ns) {
    const flags = ns.flags([['help', false]]);
    if (flags._.length === 0 || flags.help) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME [--help]`);
        return;
    }

    ns.tail();

    const srv = flags._[0];
    ns.ftpcrack(srv);
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    return [...data.servers];
}
