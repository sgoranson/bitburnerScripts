/** @param {NS} ns */
export async function main(ns) {
    ns.tail();
    ns.brutessh(ns.args[0]);
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    return [...data.servers];
}
