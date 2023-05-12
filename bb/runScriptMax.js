import { FNUM, DBG1, logConfig } from '/bb/lib.js';

logConfig.debugFlag = false;

const schema = [
    ['help', false], //
    ['srcServer', ''],
    ['scriptName', ''],
    ['threadCount'],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);
    console.log('opts :>> ', opts);

    if (opts.help || ns.args.length < 6) {
        ns.tprint(
            `usage: ${ns.getScriptName()} \\'--literal argString\\' [--srcServer SRCSERVER] [--scriptName SCRIPTNAME] [--threadCount x]  [--help] `
        );
        return;
    }

    const availRam = ns.getServerMaxRam(opts.srcServer) - ns.getServerUsedRam(opts.srcServer);
    DBG1(ns, `availRam: ${availRam}`);
    const scriptRam = ns.getScriptRam(opts.scriptName, opts.srcServer);
    DBG1(ns, `scriptRam: ${scriptRam}`);
    if (scriptRam === 0) {
        ns.tprint(`ERROR: getScriptRam failed code 0, ${opts.scriptName} not found on ${opts.srcServer}`);

        return;
    }

    const maxThreads = Math.floor(availRam / scriptRam);
    if (maxThreads === 0) {
        throw new Error('no RAM! exiting.');
    }
    const threadCount = opts.threadCount ?? maxThreads;

    DBG1(ns, `host: ${opts.srcServer} scriptName: ${opts.scriptName}`);
    DBG1(
        ns,
        `availRam: ${FNUM(ns, availRam)} scriptRam: ${FNUM(ns, scriptRam)} threadCount: ${threadCount} extra: ${opts._}`
    );

    //ns.run(opts.scriptName, maxThreads, opts.srcServer)
    console.log('opts._ :>> ', opts._);
    // eslint-disable-next-line quotes
    const noquoteArgs = opts._.map((str) => str.replaceAll("'", ''));
    console.log('noquoteArgs :>> ', noquoteArgs);

    ns.exec(opts.scriptName, opts.srcServer, threadCount, ...noquoteArgs);
    //const srv = flags._[0];
    ns.tprint(ns.getScriptLogs());
}

export function autocomplete(data, args) {
    console.debug(args);
    data.flags(schema);

    if (args.length >= 2) {
        const [prelastArg, lastArg] = args.slice(-2);
        console.debug({ prelastArg, lastArg });

        if (['--srcServer', '--targServer'].includes(prelastArg)) {
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
