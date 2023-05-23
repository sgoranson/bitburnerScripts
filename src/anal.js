/* eslint-disable no-await-in-loop */
import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['targetServer', ''],
    ['threadCount'],
    ['multiplier', 2.0],
    ['moneyTarget'],
    ['runServer'],
    ['runBatch', false],
    ['cores', 1],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    ll.logConfig.ns = ns;

    if (opts.help) {
        ns.tprint(
            `usage: ${ns.getScriptName()}  hostname [--multiplier x.x] [--runServer x] [--runBatch bool] [--threadCount x] [--targetServer x] [--moneyTarget x] [--cores x] [--help]`
        );
        return;
    }

    //ns.tail();
    let info = {};
    const serverObj = ns.getServer(ns.args[0]);
    const cores = ns.getServer(ns.getHostname()).cpuCores;

    const weakenSecurityDownUnit = ns.weakenAnalyze(1, cores);
    // const secThreadGuess = sec2lower / secLoweredForXWthreads;
    // const secLoweredByGuess = ns.weakenAnalyze(secThreadGuess, cores);
    if (serverObj.hackDifficulty > serverObj.minDifficulty * 1.1) {
        ns.tprint('WARN: ', 'high security, lowering...');
        const prepSecUp = serverObj.hackDifficulty - serverObj.minDifficulty;
        const prepWeakenThreads = prepSecUp / weakenSecurityDownUnit;
        const prepWeakenSecurityDown = ns.weakenAnalyze(prepWeakenThreads, cores);
        // skipHack = true;
        // skipGrow = true;

        ns.tprint(ll.ppJSON({ prepSecUp, prepWeakenThreads, prepWeakenSecurityDown }));
    }
    if (serverObj.moneyAvailable < 0.95 * serverObj.moneyMax) {
        ns.tprint('WARN: ', 'low money, growing...');
        const growMult = serverObj.moneyMax / serverObj.moneyAvailable; // (moneyAvail)(mult) = moneyMax :
        const growThreads = ns.growthAnalyze(ns.args[0], growMult, cores);
        const growSecurityUp = ns.growthAnalyzeSecurity(growThreads, ns.args[0], cores);
        const weakenGrowThreads = growSecurityUp / weakenSecurityDownUnit;
        const weakenGrowSecurityDown = ns.weakenAnalyze(weakenGrowThreads, cores);
        // skipHack = true;
        ns.tprint(ll.ppJSON({ growMult, growThreads, growSecurityUp, weakenGrowThreads, weakenGrowSecurityDown }));
    }
    ns.tprint('INFO: ', 'server prepped, continuing...');
    let money2hack;
    if (opts.threadCount) {
        const oneThreadHackCash = ns.hackAnalyze(ns.args[0]) * serverObj.moneyAvailable;
        money2hack = Number(opts.threadCount) * oneThreadHackCash;
    } else {
        money2hack = opts.moneyTarget ?? serverObj.moneyAvailable;
    }
    const hackThreads = ns.hackAnalyzeThreads(ns.args[0], money2hack);
    const hackSecurityUp = ns.hackAnalyzeSecurity(hackThreads, ns.args[0]);

    const weakenHackThreads = hackSecurityUp / weakenSecurityDownUnit;
    const weakenHackSecurityDown = ns.weakenAnalyze(weakenHackThreads, cores);
    const growMult = serverObj.moneyMax / (serverObj.moneyAvailable - money2hack || 1);
    ns.tprint('INFO gg:', serverObj.moneyMax, ' ', serverObj.moneyAvailable, ' ', money2hack, ' ', growMult);
    // const growMult = serverObj.moneyMax / 1; // (1)(mult) = moneyMax : because we should have $1 after a hack
    const growThreads = ns.growthAnalyze(ns.args[0], growMult, cores);
    const growSecurityUp = ns.growthAnalyzeSecurity(growThreads, undefined, cores);

    const weakenGrowThreads = growSecurityUp / weakenSecurityDownUnit;
    const weakenGrowSecurityDown = ns.weakenAnalyze(weakenGrowThreads, cores);

    const hackChance = ns.hackAnalyzeChance(ns.args[0]);
    const totalThreads = hackThreads + growThreads + weakenHackThreads + weakenGrowThreads;
    const cashPerThread = money2hack / totalThreads;

    const niceNum = (s) => Math.round(Number(s) / 1000);

    const hackTimeSec = niceNum(ns.getHackTime(ns.args[0]));
    const growTimeSec = niceNum(ns.getGrowTime(ns.args[0]));
    const weakenTimeSec = niceNum(ns.getWeakenTime(ns.args[0]));
    const hackTimeMin = hackTimeSec / 60;
    const growTimeMin = growTimeSec / 60;
    const weakenTimeMin = weakenTimeSec / 60;
    const cashPerSec = money2hack / hackTimeSec;

    const hackMax = ll.calcScriptMaxThreads({ scriptName: 'hack.js', serverName: opts.runServer ?? 'home' });
    const growMax = ll.calcScriptMaxThreads({ scriptName: 'grow.js', serverName: opts.runServer ?? 'home' });
    const weakMax = ll.calcScriptMaxThreads({ scriptName: 'weak.js', serverName: opts.runServer ?? 'home' });
    info = {
        cores,
        money2hack: ll.FMTN(money2hack),
        maxMoney: ll.FMTN(serverObj.moneyMax),
        moneyAvailable: serverObj.moneyAvailable,
        weakenSecurityDownUnit,
        hackSecurityUp,
        weakenHackSecurityDown,
        growMult,
        growSecurityUp,
        weakenGrowSecurityDown,
        hackChance,
        hackThreads,
        growThreads,
        weakenHackThreads,
        weakenGrowThreads,
        totalThreads,
        cashPerThread: ll.FMTN(cashPerThread),
        hackTimeSec,
        growTimeSec,
        weakenTimeSec,
        hackTimeMin,
        growTimeMin,
        weakenTimeMin,
        cashPerSec: ll.FMTN(cashPerSec),
        hackMax,
        growMax,
        weakMax,
    };
    //    ns.tprint(JSON.stringify(serverObj, null, '\t'));
    //}
    const str = ll.ppJSON(serverObj);
    console.log('str :>> ', str);
    ns.tprint(str);
    ns.tprint(ll.ppJSON(info));
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
