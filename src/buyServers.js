import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['upgradeOnce', false],
    ['pow', 0],
    ['max25', false],
    ['half', false],
    ['best', false],
    ['prefix', 'earl'],
];

/** @param {import(".").NS} ns  **/
export async function main(ns) {
    const opts = ns.flags(schema);
    if (opts.help) {
        ns.tprint(
            `usage: ${ns.getScriptName()}  [--upgradeOnce] [--pow x] [--best] [--max25] [--half] [--prefix str] [--help]`
        );
        return;
    }

    const maxRam = ns.getPurchasedServerMaxRam();
    // const maxRamCost = ns.getPurchasedServerCost(maxRam);
    // const maxServers = ns.getPurchasedServerLimit();
    const localRAM = ns.getServerMaxRam(ns.getHostname());

    //let ram = localRAM;
    let ram = 2;

    while (ram <= maxRam) {
        const pow = Math.log2(ram);
        const ramCost = ns.getPurchasedServerCost(ram);
        const upCost = ll.FMTN(ns.getPurchasedServerUpgradeCost(opts.prefix, ram));

        ns.tprint(`pow: ${pow} ram: ${ns.formatRam(ram)} servercost: ${ll.FMTN(ramCost)} upcost: ${upCost}`);
        ram *= 2;
    }
    ns.tprint(`12x max cost: ${ll.FMTN(ns.getPurchasedServerCost(2 ** 20) * 12)} `);

    if (opts.upgradeOnce) {
        let upgradeRet;
        let pow = 20;
        do {
            upgradeRet = ns.upgradePurchasedServer(opts.prefix, 2 ** pow);
            pow -= 1;
            if (pow < 0) break;
        } while (!upgradeRet && pow > 0);
        if (!upgradeRet) {
            ns.tprint('ERROR: buy best failed: ');
            ns.tprint(ns.getScriptLogs().join('\n'));
        } else {
            ns.tprint(`SUCCESS: u got ${2 ** (pow + 1)} `);
        }
    } else if (opts.best) {
        let tryPow = 20;
        let newHostStr = '';
        do {
            newHostStr = ns.purchaseServer(opts.prefix, 2 ** tryPow);
            tryPow -= 1;
        } while (newHostStr === '');
        if (newHostStr === '') {
            ns.tprint('ERROR: buy best failed: ');
            ns.tprint(ns.getScriptLogs().join('\n'));
        } else {
            ns.tprint(`newHostStr: ${newHostStr} RAM: ${2 ** (tryPow + 1)}`);
        }
    } else if (opts.pow) {
        ns.tprint(`buying ${opts.prefix} with ${ns.formatRam(2 ** opts.pow)}`);
        ns.purchaseServer(opts.prefix, 2 ** opts.pow);
    } else if (opts.max25) {
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
