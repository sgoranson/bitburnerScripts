import * as ll from '/bb/lib.js';

const schema = [
    ['help', false], //
    ['targetServer', String],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    console.log('opts :>> ', opts);

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} --targetServer SERVERNAME [--help]`);
        return;
    }

    const log = (s) => {
        ns.print(
            `${ll.Color.cyan} [${new Date().toLocaleTimeString()}] ${ll.Color.white} ${s} sec left ${ll.Color.reset}`
        );
    };

    ns.tail();

    const PORTNUM = 1;
    const ph = ns.getPortHandle(PORTNUM);
    ph.clear();

    let lazydb = {
        servers: ['home'],
        scripts: ['./xx --hel'],
        count: 0,
    };
    if (ph.empty()) {
        ph.write(JSON.stringify(lazydb));
    }

    while (true) {
        ns.clearLog();
        ns.disableLog('ALL');
        const portData = ph.read();
        const serverObj = ns.getServer(opts.targetServer);
        const info = {
            'income/sec': ll.FMTN(ns.getTotalScriptIncome()[1]),
            xpIncome: ns.getTotalScriptExpGain(),
            security: serverObj.hackDifficulty,
            minsecurity: serverObj.minDifficulty,
            cash: serverObj.moneyAvailable,
            maxCash: serverObj.moneyMax,
        };

        lazydb = JSON.parse(portData);
        lazydb.count += 1;
        ph.write(JSON.stringify(lazydb));
        ns.print(ll.ppJSON(lazydb));
        ns.print(ll.ppJSON(info));
        ns.ps('home').forEach((p) => ns.print(p));
        log('gg');
        // eslint-disable-next-line no-await-in-loop
        await ns.sleep(1000);
    }
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
