import * as ll from './lib.js';

ll.logConfig.debugFlag = false;

const schema = [
    ['help', false], //
    ['serverName', ''],
    ['scriptName', ''],
    ['threadCount'],
];

/** @param {import("../bb").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    ll.logConfig.ns = ns;

    // eslint-disable-next-line quotes
    const noquoteArgs = opts._.map((str) => str.replaceAll("'", ''));
    console.log('noquoteArgs :>> ', noquoteArgs);

    if (opts.help) {
        ns.tprint(
            `usage: ${ns.getScriptName()} \\'--literal argString\\' [--serverName SRCSERVER] [--scriptName SCRIPTNAME] [--threadCount x]  [--help] `
        );
        return;
    }

    const exeStr = opts.scriptName.replace('./', '');
    const maxThreads = ll.calcScriptMaxThreads({ scriptName: exeStr, serverName: opts.serverName });
    if (maxThreads === 0) {
        throw new Error('no RAM! exiting.');
    }
    const threadCount = opts.threadCount ?? maxThreads;

    // eslint-disable-next-line quotes

    ns.exec(opts.scriptName, opts.serverName, threadCount, ...noquoteArgs);
    //const srv = flags._[0];
    ns.tprint(ns.getScriptLogs());
}

export function autocomplete(data, args) {
    console.debug(args);
    data.flags(schema);

    if (args.length >= 2) {
        const [prelastArg, lastArg] = args.slice(-2);
        console.debug({ prelastArg, lastArg });

        if (['--serverName', '--targServer'].includes(prelastArg)) {
            if (!data.servers.includes(lastArg)) {
                console.debug('notaserver', { lastArg });
                return [...data.servers];
            }
            // console.debug('aserver', { lastArg });
            // return [data.flags(schema)];
        }
        if (prelastArg === '--scriptName') {
            return [...data.scripts];
        }
    }
    // console.log([data.flags(schema)]);

    return [];
    // return [data.flags(schema)];
}
