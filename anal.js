/* eslint-disable no-await-in-loop */
import * as ll from '/bb/lib.js';

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

/** @param {import("./bb").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    ll.logConfig.ns = ns;

    console.log('opts :>> ', opts);

    if (opts.help || opts.targetServer === '' || ns.args.length < 1) {
        ns.tprint(
            `usage: ${ns.getScriptName()} [--multiplier x.x] [--runServer x] [--runBatch bool] [--threadCount x] [--targetServer x] [--moneyTarget x] [--cores x] [--help]`
        );
        return;
    }

    //ns.tail();
    let info = {};
    const serverObj = ns.getServer(opts.targetServer);
    const cores = ns.getServer(opts.runServer).cpuCores;

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
        const growThreads = ns.growthAnalyze(opts.targetServer, growMult, cores);
        const growSecurityUp = ns.growthAnalyzeSecurity(growThreads, opts.targetServer, cores);
        const weakenGrowThreads = growSecurityUp / weakenSecurityDownUnit;
        const weakenGrowSecurityDown = ns.weakenAnalyze(weakenGrowThreads, cores);
        // skipHack = true;
        ns.tprint(ll.ppJSON({ growMult, growThreads, growSecurityUp, weakenGrowThreads, weakenGrowSecurityDown }));
    }
    ns.tprint('INFO: ', 'server prepped, continuing...');
    let money2hack;
    if (opts.threadCount) {
        const oneThreadHackCash = ns.hackAnalyze(opts.targetServer) * serverObj.moneyAvailable;
        money2hack = Number(opts.threadCount) * oneThreadHackCash;
    } else {
        money2hack = opts.moneyTarget ?? serverObj.moneyAvailable;
    }
    const hackThreads = ns.hackAnalyzeThreads(opts.targetServer, money2hack);
    const hackSecurityUp = ns.hackAnalyzeSecurity(hackThreads, opts.targetServer);

    const weakenHackThreads = hackSecurityUp / weakenSecurityDownUnit;
    const weakenHackSecurityDown = ns.weakenAnalyze(weakenHackThreads, cores);
    const growMult = serverObj.moneyMax / (serverObj.moneyAvailable - money2hack || 1);
    ns.tprint('INFO gg:', serverObj.moneyMax, ' ', serverObj.moneyAvailable, ' ', money2hack, ' ', growMult);
    // const growMult = serverObj.moneyMax / 1; // (1)(mult) = moneyMax : because we should have $1 after a hack
    const growThreads = ns.growthAnalyze(opts.targetServer, growMult, cores);
    const growSecurityUp = ns.growthAnalyzeSecurity(growThreads, undefined, cores);

    const weakenGrowThreads = growSecurityUp / weakenSecurityDownUnit;
    const weakenGrowSecurityDown = ns.weakenAnalyze(weakenGrowThreads, cores);

    const hackChance = ns.hackAnalyzeChance(opts.targetServer);
    const totalThreads = hackThreads + growThreads + weakenHackThreads + weakenGrowThreads;
    const cashPerThread = money2hack / totalThreads;

    const niceNum = (s) => Math.round(Number(s) / 1000);

    const hackTimeSec = niceNum(ns.getHackTime(opts.targetServer));
    const growTimeSec = niceNum(ns.getGrowTime(opts.targetServer));
    const weakenTimeSec = niceNum(ns.getWeakenTime(opts.targetServer));
    const hackTimeMin = hackTimeSec / 60;
    const growTimeMin = growTimeSec / 60;
    const weakenTimeMin = weakenTimeSec / 60;
    const cashPerSec = money2hack / hackTimeSec;

    const hackMax = ll.calcScriptMaxThreads({ scriptName: '/bb/hack.js', serverName: opts.runServer });
    const growMax = ll.calcScriptMaxThreads({ scriptName: '/bb/grow.js', serverName: opts.runServer });
    const weakMax = ll.calcScriptMaxThreads({ scriptName: '/bb/weak.js', serverName: opts.runServer });
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
