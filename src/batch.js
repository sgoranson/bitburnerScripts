/* eslint-disable no-await-in-loop */
import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['targetServer'],
    ['maxThreads'],
    ['hackLvl'],
    ['t', false],
];

function printETA(growTimeSec, weakenTimeSec, ns) {
    const ddNow = new Date();
    const growEta = new Date();
    const weakEta = new Date();
    growEta.setSeconds(growEta.getSeconds() + growTimeSec);
    weakEta.setSeconds(weakEta.getSeconds() + weakenTimeSec);
    ns.print(
        `${ll.Color.cyan} [${ddNow.toLocaleTimeString()}]\n` +
            ` ${ll.Color.white} ${growEta.toLocaleTimeString()} growETA\n` +
            ` ${ll.Color.white} ${weakEta.toLocaleTimeString()} weakETA\n` +
            ` ${ll.Color.reset}`
    );
}
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

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    ll.logConfig.ns = ns;
    console.log('opts :>> ', opts);

    if (opts.help || !opts.targetServer) {
        ns.tprint(`usage: ${ns.getScriptName()} --targetServer SERVERNAME --maxThreads x [--help]`);
        return;
    }

    const localHostname = ns.getHostname();

    while (true) {
        const niceNum = (s) => Math.round(Number(s) / 1000);

        const hackTimeSec = niceNum(ns.getHackTime(opts.targetServer));
        const growTimeSec = niceNum(ns.getGrowTime(opts.targetServer));
        const weakenTimeSec = niceNum(ns.getWeakenTime(opts.targetServer));

        let growMax;
        if (opts.maxThreads) {
            growMax = Number(opts.maxThreads);
        } else {
            growMax = ll.calcScriptMaxThreads({ scriptName: 'grow.js', serverName: localHostname });
        }

        const b1t0 = new Batch({ weakTime: weakenTimeSec, growTime: growTimeSec, hackTime: hackTimeSec });
        const b1 = b1t0.translate();
        const b2 = b1.translate(20);
        const b3 = b2.translate(20);

        const batches = [];
        batches.push(b1, b2, b3);
        const serverObj = ns.getServer(opts.targetServer);
        // const almostMaxThreads = Math.round(growMax * 0.99);
        let skipHack = false;

        if (serverObj.hackDifficulty > serverObj.minDifficulty * 1.1) {
            ns.print('INFO: high sec, skip hack');
            // const cores = ns.getServer('home').cpuCores;
            // let secFixed = ns.weakenAnalyze(growMax,cores;)
            // execf('/bb/weak.js', almostMaxThreads, 0);
            skipHack = true;
        } else if (serverObj.moneyAvailable < 0.95 * serverObj.moneyMax) {
            ns.print('INFO: low cash, skip hack');
            // execf('/bb/grow.js', almostMaxThreads, 0);
            skipHack = true;
        }

        ns.print(`batch count: ${batches.length}`);

        const adjustedThreadMax = growMax / batches.length;

        let batchHackThreads;
        let batchGrowThreads;

        const weak1Threads = Math.max(Math.round(adjustedThreadMax * 0.02), 1);
        const weak2Threads = Math.max(Math.round(adjustedThreadMax * 0.04), 1);
        if (skipHack) {
            batchHackThreads = 0;
            batchGrowThreads = Math.max(Math.round(adjustedThreadMax * 0.88), 1);
        } else {
            batchHackThreads = Math.max(Math.round(adjustedThreadMax * 0.45), 1);
            batchGrowThreads = Math.max(Math.round(adjustedThreadMax * 0.44), 1);
        }

        const execf = (exepath, threads, delay) => {
            const dd = new Date();
            dd.setSeconds(dd.getSeconds() + delay + growTimeSec);
            ns.exec(
                exepath,
                localHostname,
                threads,
                '--targetServer',
                opts.targetServer,
                '--delay',
                delay,
                '--threads',
                threads,
                '--ending',
                dd.toLocaleTimeString()
            );
        };

        printETA(niceNum(ns.getGrowTime(opts.targetServer)), niceNum(ns.getWeakenTime(opts.targetServer)), ns);

        batches.forEach((p) => {
            execf('weak.js', weak1Threads, p.se.weak1S);
            execf('weak.js', weak2Threads, p.se.weak2S);
            if (!skipHack) execf('hack.js', batchHackThreads, p.se.hackS);
            execf('grow.js', batchGrowThreads, p.se.growS);
        });

        await ns.sleep(5000);

        while (true) {
            if (
                !ns
                    .ps(localHostname)
                    .filter(({ args }) => args.includes(opts.targetServer))
                    .some((x) => /(weak|hack|grow)/.test(x.filename))
            ) {
                ns.print(`INFO: no batch scripts running on ${localHostname}, all done`);
                break;
            } else {
                await ns.sleep(5000);
            }
        }
    }
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
