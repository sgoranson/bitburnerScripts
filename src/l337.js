// @ts-ignore
import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['sploit', false],
    ['list', false],
    ['solo', false],
    ['targetServer', ''],
    ['tail', false],
    ['scp', false],
    ['killall', false],
    ['exec', ''],
    ['farmbatch', false],
    ['farmshare', false],
    ['loop', false],
    ['minHackSkill', -Infinity],
];

/** @param {import(".").NS} ns  **/

function ezServerList(ns, minHackSkill) {
    const reqHackLevel = ns.getHackingLevel();
    // const reqHackLevel = opts.minHackSkill === 0 ? ns.getHackingLevel() : Number(opts.minHackSkill);
    /**@type {import(".").Server[]} */
    const servers = ll.treeScan(ns);

    const proggies = ['BruteSSH.exe', 'FTPCrack.exe', 'HTTPWorm.exe', 'SQLInject.exe', 'relaySMTP.exe'];
    // eslint-disable-next-line no-unused-vars
    const progCount = proggies.reduce((a, i) => (ns.ls('home', '.exe').includes(i) ? a + 1 : a), 0);
    const ezServers = servers
        .filter((s) => s.requiredHackingSkill <= reqHackLevel)
        .filter((s) => s.requiredHackingSkill > minHackSkill)
        .filter((s) => !s.purchasedByPlayer)
        .filter((s) => s.numOpenPortsRequired <= progCount)
        .filter((s) => s.hostname !== 'darkweb')
        // .sort((a, b) => b.moneyMax - a.moneyMax);
        .sort((a, b) => b.requiredHackingSkill - a.requiredHackingSkill);
    return ezServers;
}
/** @param {import(".").NS} ns  **/
function exec(opts, ezServers, ns) {
    const exeStr = opts.exec.replace('./', '');
    ezServers.forEach((s) => {
        ns.exec(exeStr, s.hostname);
    });
    ns.tprint(ns.getScriptLogs());
}

function scp(ns, ezServers) {
    const fileList = ns.ls('home', '.js');
    ezServers.forEach((s) => {
        ns.scp(fileList, s.hostname);
    });
    [...Array(25)]
        .map((s, i) => `earl${i}`)
        .filter((s) => ns.serverExists(s))
        .forEach((s) => {
            ns.scp(fileList, s);
        });
    [...Array(25)]
        .map((s, i) => `hank${i}`)
        .filter((s) => ns.serverExists(s))
        .forEach((s) => {
            ns.scp(fileList, s);
        });
    ns.tprint(ns.getScriptLogs().join('\n'));
}

function farmbatch(ns, ezServers) {
    [...Array(25)]
        .map((s, i) => `earl${i}`)
        .filter((s) => ns.serverExists(s))
        .forEach((s) => {
            const maxThreads = ll.calcScriptMaxThreads({ scriptName: 'grow.js', serverName: s });
            const maxThreadsPerBatch = Math.round(maxThreads / ezServers.length);
            ns.killall(s);

            ezServers.forEach((ez) => {
                ns.exec(
                    'batch.js',
                    // @ts-ignore
                    s,
                    1,
                    '--targetServer',
                    ez.hostname,
                    '--maxThreads',
                    maxThreadsPerBatch
                );
                ns.tprint(`INFO: ${s}: batch targeting ${ez.hostname} hackLvl: ${ez.requiredHackingSkill}\n`);
            });
        });
}

/** @param {import(".").NS} ns  **/
function farmshare(ns) {
    [...Array(25)]
        .map((s, i) => `hank${i}`)
        .filter((s) => ns.serverExists(s))
        .forEach((s) => {
            const maxThreads = ll.calcScriptMaxThreads({ scriptName: 'share.js', serverName: s });
            ns.killall(s);

            ns.exec('share.js', s, maxThreads);
            ns.tprint(`INFO: farm share ${s}\n`);
        });
}

/** @param {import(".").NS} ns  **/
function solo(ns, ezServers) {
    const maxThreads = ll.calcScriptMaxThreads({ scriptName: 'grow.js', serverName: ns.getHostname() });
    const maxThreadsPerBatch = Math.round(maxThreads / ezServers.length);
    const hackLvl = ns.getHackingLevel();
    ezServers.forEach((s) => {
        ns.exec(
            'batch.js',
            // @ts-ignore
            ns.getHostname(),
            1,
            '--targetServer',
            s.hostname,
            '--maxThreads',
            maxThreadsPerBatch,
            '--hackLvl',
            hackLvl
        );
        ns.tprint(`INFO: batch targeting ${s.hostname} hackLvl: ${s.requiredHackingSkill}\n`);
    });
}

function loop(ezServers, ns, opts) {
    ezServers.forEach((s) => {
        const maxThreads = Math.max(ll.calcScriptMaxThreads({ scriptName: 'loop.js', serverName: s.hostname }), 1);
        ns.killall(s.hostname);
        ns.exec('loop.js', s.hostname, maxThreads, '--targetServer', opts.targetServer);
        ns.print(`INFO: loop targeting ${opts.targetServer} \n`);
    });
}

function killall(ezServers, ns) {
    ezServers.forEach((s) => {
        ns.killall(s.hostname);
        ns.tprint(`killall ${s.hostname}`);
    });
    [...Array(25)]
        .map((s, i) => `earl${i}`)
        .filter((s) => ns.serverExists(s))
        .forEach((s) => {
            ns.killall(s);
            ns.tprint(`killall ${s}`);
        });
    [...Array(25)]
        .map((s, i) => `hank${i}`)
        .filter((s) => ns.serverExists(s))
        .forEach((s) => {
            ns.killall(s);

            ns.tprint(`killall ${s}`);
        });
}

function list(ezServers, ns) {
    ezServers
        .map(
            ({
                hostname,
                maxRam,
                numOpenPortsRequired,
                moneyAvailable,
                moneyMax,
                requiredHackingSkill,
                hackDifficulty,
                minDifficulty,
                path,
            }) => ({
                hostname,
                maxRam,
                numOpenPortsRequired,
                moneyavail: Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(
                    moneyAvailable
                ),
                moneyMax: Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(moneyMax),
                requiredHackingSkill,
                hackDifficulty,
                minDifficulty,
                path,
            })
        )
        .forEach((s) => {
            ns.tprint(s);
        });
}

function sploit(ezServers, ns) {
    ezServers.forEach((s) => {
        //   ns.tprint('INFO: ', s);
        try {
            ll.l337(ns, s.hostname);
        } catch (e) {
            ns.tprint(`1337 failed on ${s.hostname}: error: ${String(e)}`);
        }
    });

    ns.getScriptLogs().forEach((s) => {
        ns.tprint(s, '\n');
    });
}
export async function main(ns) {
    // @ts-ignore
    const opts = ns.flags(schema);
    ll.logConfig.ns = ns;
    console.log('opts :>> ', opts);

    if (opts.help || ns.args.length === 0) {
        ns.tprint(
            `usage: ${ns.getScriptName()} --sploit --list --solo  [--targetServer HOSTNAME] [--killall] [--farmshare] [--tail] [--minHackSkill] [--scp] [--exec script] [--farmbatch] [--help]`
        );
        return;
    }
    if (opts.tail) ns.tail();

    const ezServers = ezServerList(ns, opts.minHackSkill);

    if (opts.farmshare) {
        farmshare(ns);
    } else if (opts.sploit) {
        sploit(ezServers, ns);
    } else if (opts.list) {
        list(ezServers, ns);
    } else if (opts.killall) {
        killall(ezServers, ns);
    } else if (opts.loop) {
        loop(ezServers, ns, opts);
    } else if (opts.solo) {
        solo(ns, ezServers);
    } else if (opts.farmbatch) {
        farmbatch(ns, ezServers);
    } else if (opts.scp) {
        scp(ns, ezServers);
    } else if (opts.exec) {
        exec(opts, ezServers, ns);
    }
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
