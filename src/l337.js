// @ts-ignore
import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['sploit', false],
    ['list', false],
    ['batch', false],
    ['runServer', ''],
    ['targetServer', ''],
    ['tail', false],
    ['scp', false],
    ['killall', false],
    ['exec', ''],
    ['farmbatch', false],
    ['loop', false],
    ['minHackSkill', -Infinity],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    // @ts-ignore
    const opts = ns.flags(schema);
    ll.logConfig.ns = ns;
    console.log('opts :>> ', opts);

    if (opts.help || ns.args.length === 0) {
        ns.tprint(
            `usage: ${ns.getScriptName()} --sploit --list --batch [--runServer HOSTNAME] [--targetServer HOSTNAME] [--killall] [--tail] [--minHackSkill] [--scp] [--exec script] [--farmbatch] [--help]`
        );
        return;
    }
    if (opts.tail) ns.tail();

    const reqHackLevel = ns.getHackingLevel();
    // const reqHackLevel = opts.minHackSkill === 0 ? ns.getHackingLevel() : Number(opts.minHackSkill);
    /**@type {import(".").Server[]} */
    const servers = ll.treeScan(ns);

    const proggies = ['BruteSSH.exe', 'FTPCrack.exe', 'HTTPWorm.exe', 'SQLInject.exe', 'relaySMTP.exe'];
    const progCount = proggies.reduce((a, i) => (ns.ls('home', '.exe').includes(i) ? a + 1 : a), 0);
    const ezServers = servers
        .filter((s) => s.requiredHackingSkill <= reqHackLevel)
        .filter((s) => s.requiredHackingSkill > opts.minHackSkill)
        .filter((s) => !s.purchasedByPlayer)
        // .filter((s) => s.numOpenPortsRequired <= progCount)
        .filter((s) => s.hostname !== 'darkweb')
        // .sort((a, b) => b.moneyMax - a.moneyMax);
        .sort((a, b) => b.requiredHackingSkill - a.requiredHackingSkill);

    if (opts.sploit) {
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
        //const srv = flags._[0];
    } else if (opts.list) {
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
                    moneyMax: Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(
                        moneyMax
                    ),
                    requiredHackingSkill,
                    hackDifficulty,
                    minDifficulty,
                    path,
                })
            )
            .forEach((s) => {
                ns.tprint(s);
            });
    } else if (opts.killall) {
        ezServers.forEach((s) => {
            ns.killall(s.hostname);
        });
    } else if (opts.loop) {
        ezServers.forEach((s) => {
            const maxThreads = Math.max(ll.calcScriptMaxThreads({ scriptName: 'loop.js', serverName: s.hostname }), 1);
            ns.killall(s.hostname);
            ns.exec('loop.js', s.hostname, maxThreads, '--targetServer', opts.targetServer);
            ns.print(`INFO: loop targeting ${opts.targetServer} \n`);
        });
    } else if (opts.batch) {
        const maxThreads = ll.calcScriptMaxThreads({ scriptName: 'grow.js', serverName: ns.getHostname() });
        const maxThreadsPerBatch = Math.round(maxThreads / ezServers.length);
        ezServers.forEach((s) => {
            ns.exec(
                'batch.js',
                // @ts-ignore
                ns.getHostname(),
                1,
                '--targetServer',
                s.hostname,
                '--runServer',
                ns.getHostname(),
                '--maxThreads',
                maxThreadsPerBatch
            );
            ns.tprint(`INFO: batch targeting ${s.hostname} hackLvl: ${s.requiredHackingSkill}\n`);
        });
    } else if (opts.farmbatch) {
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
                        '--runServer',
                        s,
                        '--maxThreads',
                        maxThreadsPerBatch
                    );
                    ns.tprint(`INFO: ${s}: batch targeting ${ez.hostname} hackLvl: ${ez.requiredHackingSkill}\n`);
                });
            });
    } else if (opts.scp) {
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
    } else if (opts.exec) {
        const exeStr = opts.exec.replace('./', '');
        ezServers.forEach((s) => {
            ns.exec(exeStr, s.hostname);
        });
        ns.tprint(ns.getScriptLogs());
    }
    // 26 ./bb/batch.js --targetServer sigma-cosmetics --srcServer hank1 --maxThreads 13000
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
