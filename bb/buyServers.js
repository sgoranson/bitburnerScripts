import * as ll from '/bb/lib.js';

const schema = [
    ['help', false], //
    ['buy', false],
    ['targetServer', ''],
    ['upgradeOnce', false],
    ['pow', 0],
    ['list', false],
];

/** @param {import(".").NS} ns  **/
export async function main(ns) {
    const opts = ns.flags(schema);
    if (opts.help || !opts.targetServer) {
        ns.tprint(
            `usage: ${ns.getScriptName()} [--targetServer HOSTNAME] [--buy] [--upgradeOnce] [--pow x] [--list] [--help]`
        );
        return;
    }

    const maxRam = ns.getPurchasedServerMaxRam();
    const maxRamCost = ns.getPurchasedServerCost(maxRam);
    const maxServers = ns.getPurchasedServerLimit();

    ns.tprint(
        `maxRam: ${ns.formatRam(maxRam)} servercost: ${ns.formatNumber(
            maxRamCost,
            2,
            1000,
            true
        )} maxServers: ${maxServers}`
    );

    let pow = 7;
    let ram = 2 ** pow;
    if (opts.upgradeOnce && opts.pow) {
        ns.upgradePurchasedServer(opts.targetServer, 2 ** opts.pow);
    }
    if (opts.list) {
        while (ram <= maxRam) {
            const ramCost = ns.getPurchasedServerCost(ram);
            const upCost = ll.FMTN(ns.getPurchasedServerUpgradeCost(opts.targetServer, ram));

            ns.tprint(
                `pow: ${pow} ram: ${ns.formatRam(ram)} servercost: ${ns.formatNumber(
                    ramCost,
                    2,
                    1000,
                    true
                )} upcost: ${upCost}`
            );
            pow += 1;
            ram = 2 ** pow;
        }
    }

    if (opts.buy && opts.pow) {
        ns.tprint(`buying ${opts.targetServer} with ${ns.formatRam(2 ** opts.pow)}`);
        ns.purchaseServer(opts.targetServer, 2 ** opts.pow);
    }
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, args) {
    data.flags(schema);
    return [...data.servers];
}
