import * as ll from './lib.js';

const schema = [
    ['help', false], //
];

const PREFIX = 'hankz';

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    ll.logConfig.ns = ns;

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()}  [--help]`);
        // eslint-disable-next-line no-useless-return
        return;
    }

    const P = (str) => {
        ns.tprint(str);
    };

    const PP = (str) => {
        ll.ppRow(str);
    };

    const serverPrices = () => {
        const prices = [];

        if (!ns.serverExists(PREFIX)) throw new Error(`${PREFIX} no existe`);

        for (let pow = 1; pow <= 20; pow += 1) {
            const price = ns.getPurchasedServerUpgradeCost(PREFIX, 2 ** pow);
            if (price !== -1) prices.push([pow, price]);
        }

        return prices.sort((a, b) => b[1] - a[1]);
    };

    const bestUpgradePrice = (bank) => {
        const prices = serverPrices();
        for (const [pow, price] of prices) {
            if (bank >= price) return pow;
        }
        return -1;
    };

    const maxUpgradeFarm = (prefix, bank) => {
        if (!ns.serverExists(prefix)) {
            ns.purchaseServer(prefix, 2);
        }

        const pow = bestUpgradePrice(bank);

        if (pow !== -1) {
            ns.upgradePurchasedServer(prefix, 2 ** pow);
            ns.print(`upgraded farm ${prefix} ${2 ** pow} GB`);
        }
    };
    const prices = serverPrices();
    P(prices);
    P(bestUpgradePrice(1e6));

    // ns.tprint(ns.getScriptLogs().join('\n'));

    /*
        - disable log msgs
        - start up gui

        - loop:
            - gen list of all connected servers
            - hack all possible
            - if home ram >= 1TB
                - alg = batch
            - else
                - alg = loop
       
            - calc $/sec for solo hack (useless without formulas)
            - calc $/sec for alg (useless without formulas)
            - start everywhere ram available
            - sleep
            - if $ > current$ * 2
                - killall
            - if $, buy/upgrade server 
            


    */
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
