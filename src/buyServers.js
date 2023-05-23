import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['buy', false],
    ['upgradeOnce', false],
    ['pow', 0],
    ['list', false],
    ['max', false],
    ['half', false],
    ['prefix', 'earl'],
];

/** @param {import(".").NS} ns  **/
export async function main(ns) {
    const opts = ns.flags(schema);
    if (opts.help) {
        ns.tprint(
            `usage: ${ns.getScriptName()} [--buy] [--upgradeOnce] [--pow x] [--list] [--max] [--half] [--prefix str] [--help]`
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
        ns.upgradePurchasedServer(opts.prefix, 2 ** opts.pow);
    }

    if (opts.list) {
        while (ram <= maxRam) {
            const ramCost = ns.getPurchasedServerCost(ram);
            const upCost = ll.FMTN(ns.getPurchasedServerUpgradeCost(opts.prefix, ram));

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
        ns.tprint(`buying ${opts.prefix} with ${ns.formatRam(2 ** opts.pow)}`);
        ns.purchaseServer(opts.prefix, 2 ** opts.pow);
    } else if (opts.max) {
        [...Array(25)].forEach((x, i) => {
            const servName = `${opts.prefix}${i}`;
            if (!ns.serverExists(servName)) {
                ns.purchaseServer(servName, 2 ** 20);
            }
        });
        ns.tprint(ns.getScriptLogs().join('\n'));
    } else if (opts.half) {
        [...Array(12)].forEach((x, i) => {
            const servName = `${opts.prefix}${i}`;
            if (!ns.serverExists(servName)) {
                ns.purchaseServer(servName, 2 ** 20);
            }
        });
        ns.tprint(ns.getScriptLogs().join('\n'));
    }
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, args) {
    data.flags(schema);
    return [...data.servers];
}
