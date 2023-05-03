/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags([
        ['help', false],
        ['buy', false],
        ['pow', 0],
    ]);
    if (flags.help) {
        ns.tprint(`usage: ${ns.getScriptName()} [HOSTNAME] [--buy] [--help]`);
        return;
    }

    const srv = flags._[0] || 'home';
    const maxRam = ns.getPurchasedServerMaxRam();
    const maxRamCost = ns.getPurchasedServerCost(maxRam);
    const maxServers = ns.getPurchasedServerLimit();

    ns.tprint(`maxRam: ${ns.formatRam(maxRam)} servercost: ${ns.formatNumber(maxRamCost, 2, 1000, true)} maxServers: ${maxServers}`);

    let pow = 7;
    let ram = 2 ** pow;

    if (!flags.buy) {
        while (ram < maxRam) {
            const ramCost = ns.getPurchasedServerCost(ram);
            const upCost = ns.formatNumber(ns.getPurchasedServerUpgradeCost(srv, ram), 2, 1000, true);

            ns.tprint(`pow: ${pow} ram: ${ns.formatRam(ram)} servercost: ${ns.formatNumber(ramCost, 2, 1000, true)} upcost: ${upCost}`);
            pow += 1;
            ram = 2 ** pow;
        }
    }

    if (flags.buy && flags.pow != 0) {
        ns.tprint(`buying ${srv} with ${ns.formatRam(2 ** flags.pow)}`);
        ns.purchaseServer(srv, 2 ** flags.pow);
    }
}

export function autocomplete(data, args) {
    return [...data.servers];
}
