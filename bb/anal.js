/* eslint-disable no-await-in-loop */
import * as ll from '/bb/lib.js';

const schema = [
    ['help', false], //
    ['targetServer', ''],
    ['threadCount'],
    ['multiplier', 2.0],
    ['moneyTarget'],
    ['runServer', 'home'],
    ['runBatch', false],
    ['cores', 1],
];

/** @param {import(".").NS} ns  **/

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

    let skipGrow = false;
    let skipHack = false;
    const weakenSecurityDownUnit = ns.weakenAnalyze(1, cores);
    // const secThreadGuess = sec2lower / secLoweredForXWthreads;
    // const secLoweredByGuess = ns.weakenAnalyze(secThreadGuess, cores);
    if (serverObj.hackDifficulty > serverObj.minDifficulty * 1.1) {
        ns.tprint('WARN: ', 'high security, lowering...');
        const prepSecUp = serverObj.hackDifficulty - serverObj.minDifficulty;
        const prepWeakenThreads = prepSecUp / weakenSecurityDownUnit;
        const prepWeakenSecurityDown = ns.weakenAnalyze(prepWeakenThreads, cores);
        skipHack = true;
        skipGrow = true;

        ns.tprint(ll.ppJSON({ prepSecUp, prepWeakenThreads, prepWeakenSecurityDown }));
    } else if (serverObj.moneyAvailable < 0.95 * serverObj.moneyMax) {
        ns.tprint('WARN: ', 'low money, growing...');
        const growMult = serverObj.moneyMax / serverObj.moneyAvailable; // (moneyAvail)(mult) = moneyMax :
        const growThreads = ns.growthAnalyze(opts.targetServer, growMult, cores);
        const growSecurityUp = ns.growthAnalyzeSecurity(growThreads, opts.targetServer, cores);
        const weakenGrowThreads = growSecurityUp / weakenSecurityDownUnit;
        const weakenGrowSecurityDown = ns.weakenAnalyze(weakenGrowThreads, cores);
        skipHack = true;
        ns.tprint(ll.ppJSON({ growMult, growThreads, growSecurityUp, weakenGrowThreads, weakenGrowSecurityDown }));
    } else {
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

        const hackMax = ll.calcScriptMaxThreads({ scriptName: '/bb/hack.js', serverName: 'home' });
        const growMax = ll.calcScriptMaxThreads({ scriptName: '/bb/grow.js', serverName: 'home' });
        const weakMax = ll.calcScriptMaxThreads({ scriptName: '/bb/weak.js', serverName: 'home' });
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
    }
    const str = ll.ppJSON(serverObj);
    console.log('str :>> ', str);
    ns.tprint(str);
    ns.tprint(ll.ppJSON(info));
    /*
2876/8614
102
7903
554


*/
    /*
        weak1S                     weak1E               
        XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               
            weak2S                             weak2E          
        ----XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          
                growS                     growE          
        --------XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX         
                    hackS      hackE          
        ------------XXXXXXXXXXXXXXXX           
                                            weak1S                     weak1E               
                                            XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX               
                                                weak2S                             weak2E          
                                                XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          
                                                    growS                     growE          
                                                    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX         
                                                        hackS      hackE          
                                                        XXXXXXXXXXXXXXXX           


     # batch rules
     1. given hackE = t0:
        * weak1E = hackE + 5
        * growE = weak1E + 5
        * weak2E = growE + 5
     2. hackS = hackE - hackTime
        * growS = growE - growTime
        * weak2S = weak2E - weakTime 
        * weak1S = weak1E - weakTime 
     3. given we want weak1S at t0, translate the points to the right, i.e. +(-weakS) 
     # next batch
     1. just translate +20 (15 we added last batch, +5 for kicks)
     2. cancel if hackS-2 > hackE-1


     [$2.8e6/sec (active), 222xp/sec, $374K/sec (since reset)]
    */
    class Batch {
        constructor({ weakTime = 20, hackTime = 5, growTime = 10, t0 = 0 } = {}) {
            this.se = {};
            const { se } = this;
            se.hackE = t0;
            se.hackS = se.hackE - hackTime;
            se.weak1E = se.hackE + 5;
            se.weak1S = se.weak1E - weakTime;
            se.growE = se.weak1E + 5;
            se.growS = se.growE - growTime;
            se.weak2E = se.growE + 5;
            se.weak2S = se.weak2E - weakTime;
        }

        translate(shiftp) {
            const ret = new Batch();
            const shift = shiftp ?? Math.abs(this.se.weak1S);
            ret.se = Object.fromEntries(Object.entries(this.se).map(([k, v]) => [k, v + shift]));
            return ret;
        }

        // toString() {
        //     const { se } = this;
        //     return `${'-'.repeat(se.weak1S) + 'W'.repeat(se.weak1E - se.weak1S)}\n${'-'.repeat(se.weak2S)}${'W'.repeat(
        //         se.weak2E - se.weak2S
        //     )}\n${'-'.repeat(se.growS)}${'G'.repeat(se.growE - se.growS)}\n${'-'.repeat(se.hackS)}${'H'.repeat(
        //         se.hackE - se.hackS
        //     )}\n`;
        // }
    }

    const exopt = {};

    const b1t0 = new Batch({ weakTime: info.weakenTimeSec, growTime: info.growTimeSec, hackTime: info.hackTimeSec });
    const b1 = b1t0.translate();
    const b2 = b1.translate(20);
    const b3 = b2.translate(20);

    const batches = [];
    batches.push(b1, b2, b3);
    // while (true) {
    //     const newBatch = batches[batches.length - 1].translate(20);
    //     if (newBatch.se.hackS > batches[0].se.hackE) {
    //         break;
    //     } else {
    //         batches.push(newBatch);

    //         ns.tprint(`hackS: ${newBatch.se.hackS} hackE: ${batches[0].se.hackE}`);
    //     }
    // }
    ns.tprint(`batch count: ${batches.length}`);

    const adjustedThreadMax = info.growMax / batches.length;

    const weak1Threads = Math.round(adjustedThreadMax * 0.02);
    const weak2Threads = Math.round(adjustedThreadMax * 0.04);
    const hackThreads = Math.round(adjustedThreadMax * 0.45);
    const growThreads = Math.round(adjustedThreadMax * 0.44);

    const runServer = 'home';

    console.log('info :>> ', info);
    console.log('exopt :>> ', exopt);

    const execf = (exepath, threads, delay) => {
        ns.exec(exepath, runServer, threads, '--targetServer', opts.targetServer, '--delay', delay);
    };

    if (opts.runBatch) {
        while (true) {
            // execf('/bb/weak.js', weak1Threads, weak1S);
            // execf('/bb/weak.js', weak2Threads, weak2S);
            // if (!skipHack) execf('/bb/hack.js', hackThreads, hackS);
            // if (!skipGrow) execf('/bb/grow.js', growThreads, growS);
            if (skipGrow || skipHack) {
                console.log('skip');
            }
            batches.forEach((p) => {
                execf('/bb/weak.js', weak1Threads, p.se.weak1S);
                execf('/bb/weak.js', weak2Threads, p.se.weak2S);
                execf('/bb/hack.js', hackThreads, p.se.hackS);
                execf('/bb/grow.js', growThreads, p.se.growS);
            });

            await ns.sleep(5000);

            while (true) {
                if (!ns.ps(runServer).some((x) => /(weak|hack|grow)/.test(x.filename))) {
                    ns.tprint(`INFO: no batch scripts running on ${runServer}, all done`);
                    break;
                } else {
                    await ns.sleep(5000);
                }
            }
        }
    }
    /*
    const log = (s) => {
        ns.print(`${ll.Color.cyan} [${new Date().toLocaleTimeString()}] ${ll.Color.white} ${s} ${ll.Color.reset}`);
    };

    */
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
