/* eslint-disable no-unused-vars */
import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['targetServer'],
];

function ramCost(currentRam) {
    const numUpgrades = Math.log2(currentRam);

    //Calculate cost
    //Have cost increase by some percentage each time RAM has been upgraded
    return [currentRam * 32e3 * 1.58 ** numUpgrades, currentRam * 55e3];
}
/** @param {import(".").NS} ns  **/
export async function main(ns) {
    const opts = ns.flags(schema);

    ll.logConfig.ns = ns;

    if (opts.help || !ns.args.length) {
        ns.tprint(
            `usage: ${ns.getScriptName()} threads cores servername hackDifficulty moneyAvailable moneyMax serverGrowth  [--help]`
        );
        return;
    }
    /* weaken:
     The runtime for this function depends on your hacking level and the target server’s 
     security level when this function is called. This function lowers the security level 
     of the target server by 0.05.
    //  const weakenTimeMultiplier = 4;
    //    const growTimeMultiplier = 3.2; // Relative to hacking time. 16/5 = 3.2
              ServerFortifyAmount: 0.002, // Amount by which server's security increases when its hacked/grown
  ServerWeakenAmount: 0.05, // Amount by which server's security decreases when weakened   

   return 2 * CONSTANTS.ServerFortifyAmount * threads;
  */
    const [threads, cores, serverStr, hackDifficulty, moneyAvailable, moneyMax, serverGrowth] = ns.args;
    // threads = Number(threads);
    const serverFN = `${serverStr}.txt`;
    const player = ns.getPlayer();
    const argServer = ns.getServer(serverStr);
    const gp = ns.formulas.hacking.growPercent(argServer, threads, player, cores);
    const gth = ns.formulas.hacking.growThreads(argServer, player, argServer.moneyMax, cores);
    const mockServer = ns.formulas.mockServer();
    // const gt = ns.formulas.hacking.hackChance(server,player);
    // const gt = ns.formulas.hacking.hackExp(server,player);
    // const gt = ns.formulas.hacking.hackPercent(server,player);

    // const gt = ns.formulas.hacking.hackTime(server,player);
    const gt = ns.formulas.hacking.growTime(argServer, player);
    // ns.formulas.hacking.weakenTime(server,player);
    ns.tprint(ll.ppJSON(player));
    ns.tprint(ll.ppJSON(argServer));
    ns.tprint(`INFO: growTime: ${ll.ppJSON(gt)}\n`);
    ns.tprint(`INFO: growThreads: ${gth}\n`);
    ns.tprint(`INFO: growPercent: ${ll.ppJSON(gp)}\n`);

    // const serverJSON = JSON.stringify(serverObj, null, '\t');
    // ns.write(serverFN, serverJSON, 'w');
    const txtServerObj = JSON.parse(ns.read(serverFN));
    txtServerObj.hackDifficulty = hackDifficulty;
    txtServerObj.moneyAvailable = moneyAvailable;
    txtServerObj.moneyMax = moneyMax;
    txtServerObj.serverGrowth = serverGrowth;
    const growRam = ns.getScriptRam('grow.js');
    for (let n = 32; n <= 2 ** 30; n *= 2) {
        const [ramCostA, ramCostB] = ramCost(n);
        ns.tprint(`grow.js: (${growRam}GB) \
        (system ${ll.FMTN(n)} GB)\
             (${Math.floor(n / growRam)} thr) \
             ($ ${ll.FMTN(ramCostA)})\
             ($ ${ll.FMTN(ramCostB)})\
             `);
    }
    const localMaxThreads = ll.calcScriptMaxThreads({ scriptName: 'grow.js', serverName: 'home' });
    ns.tprint(`INFO: localMaxThreads: ${ll.ppJSON(localMaxThreads)}\n`);
    ns.tprint(
        `INFO: ns.formulas.hacking.growThreads(txtServerObj, player, Infinity, cores): 
        ${ns.formulas.hacking.growThreads(txtServerObj, player, Infinity, cores)}\n`
    );
    ns.tprint(
        `INFO: ns.formulas.hacking.growThreads(argServer, player, Infinity, cores): 
        ${ns.formulas.hacking.growThreads(argServer, player, Infinity, cores)}\n`
    );
    //player.skills.hacking = 1;
    //const srv = flags._[0];
    ns.tprint(`INFO: ns.weakenAnalyze(1, cores): ${ll.ppJSON(ns.weakenAnalyze(threads, cores))}\n`);
    ns.tprint(
        `INFO: ns.growthAnalyzeSecurity(threads, 'iron-gym', cores): ${ll.ppJSON(
            ns.growthAnalyzeSecurity(threads, 'iron-gym', cores)
        )}\n`
    );
    ns.tprint('[threads, cores, serverStr, hackDifficulty, moneyAvailable, moneyMax, serverGrowth]');
    /*
            const growThreads = ns.growthAnalyze(ns.args[0], growMult, cores);
        const growSecurityUp = ns.growthAnalyzeSecurity(growThreads, ns.args[0], cores);
        */
    //const growThreads = ns.growthAnalyze(ns.args[0], growMult, cores);

    /**
     *
     *
     * @typedef {import(".").Server} Server
     * @param {Server} s
     * @returns {Number}
     */
    const getMoneyAvaiable = (s) => s.moneyAvailable;

    const servers = ll.treeScan(ns);
    /*
    const gp = ns.formulas.hacking.growPercent(argServer, threads, player, cores);
    const gth = ns.formulas.hacking.growThreads(argServer, player, argServer.moneyMax, cores);
    // const gt = ns.formulas.hacking.hackChance(server,player);
    // const gt = ns.formulas.hacking.hackExp(server,player);
     const gt = ns.formulas.hacking.hackPercent(server,player);

    // const gt = ns.formulas.hacking.hackTime(server,player);
    const gt = ns.formulas.hacking.growTime(argServer, player);
    // ns.formulas.hacking.weakenTime(server,player);


    const mockServer = ns.formulas.mockServer();
*/
    /*
        moneyAvailable
*/

    const pprint = (obj) => {
        const FMTN = Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format;
        let str = '{ ';
        for (const [k, v] of Object.entries(obj)) {
            const vStr = typeof v === 'number' ? FMTN(v) : String(v);

            str += `${k} : ${vStr.padEnd(6)}, `;
        }
        str += '} ';
        return str;
    };

    const rows = [];
    for (const s of servers) {
        const etc = {};
        etc.hn = s.hostname.padEnd(20);
        etc.cashHackedT1 = ns.formulas.hacking.hackPercent(s, player) * s.moneyAvailable;
        etc.hackTime = ns.formulas.hacking.hackTime(s, player);
        etc.weakTime = ns.formulas.hacking.weakenTime(s, player);
        etc.cashPerSec = etc.cashHackedT1 / etc.hackTime;
        etc.growT = ns.formulas.hacking.growThreads(s, player, Infinity, cores);
        etc.growPercentT1 = ns.formulas.hacking.growPercent(s, 1, player, cores);
        etc.growPercentT1k = ns.formulas.hacking.growPercent(s, 1e3, player, cores);
        etc.diff = s.hackDifficulty - s.minDifficulty;
        etc.moneyAvail = s.moneyAvailable;
        rows.push(etc);
    }
    rows.sort((a, b) => b.cashPerSec - a.cashPerSec).forEach((r) => ns.tprint(pprint(r)));
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
