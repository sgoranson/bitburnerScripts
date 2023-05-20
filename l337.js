// @ts-ignore
import * as ll from '/bb/lib.js';

const schema = [
    ['help', false], //
    ['sploit', false],
    ['list', false],
    ['batch', false],
    ['runServer', false],
    ['tail', false],
];

/** @param {import("./bb").NS} ns  **/

export async function main(ns) {
    // @ts-ignore
    const opts = ns.flags(schema);
    ll.logConfig.ns = ns;
    console.log('opts :>> ', opts);

    if (opts.help || (opts.batch && !opts.runServer) || ns.args.length === 0) {
        ns.tprint(`usage: ${ns.getScriptName()} --sploit --list --batch [--runServer HOSTNAME] [--tail] [--help]`);
        return;
    }
    if (opts.tail) ns.tail();

    const myHackLvl = ns.getHackingLevel();
    const servers = ll.treeScan(ns);

    const ezServers = servers
        .filter((s) => s.requiredHackingSkill <= myHackLvl)
        .filter((s) => !s.purchasedByPlayer)
        // .sort((a, b) => b.moneyMax - a.moneyMax);
        .sort((a, b) => b.requiredHackingSkill - a.requiredHackingSkill);

    if (opts.sploit) {
        ezServers.forEach((s) => {
            ns.tprint('INFO: ', s);
            ll.l337(ns, s.hostname);
        });

        ns.getScriptLogs().forEach((s) => {
            ns.tprint(s, '\n');
        });
        //const srv = flags._[0];
    } else if (opts.list) {
        ezServers
            .map(({ hostname, moneyMax, requiredHackingSkill, path }) => ({
                hostname,
                moneyMax,
                requiredHackingSkill,
                path,
            }))
            .forEach((s) => {
                ns.tprint(s);
            });
    } else if (opts.batch) {
        const maxThreads = ll.calcScriptMaxThreads({ scriptName: '/bb/grow.js', serverName: opts.runServer });
        const maxThreadsPerBatch = Math.round(maxThreads / ezServers.length);
        ezServers.forEach((s) => {
            ns.exec(
                '/bb/batch.js',
                // @ts-ignore
                opts.runServer,
                1,
                '--targetServer',
                s.hostname,
                '--runServer',
                opts.runServer,
                '--maxThreads',
                maxThreadsPerBatch
            );
        });
    }
    // 26 ./bb/batch.js --targetServer sigma-cosmetics --srcServer hank1 --maxThreads 13000
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
