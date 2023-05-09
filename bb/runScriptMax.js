import { FNUM, DBG1 } from '/bb/lib.js';

const server = 'home';
const scriptName = '/bb/growWeak.js';
const schema = [
    ['help', false],
    ['server', server],
    ['scriptName', scriptName],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} [--server SERVERNAME] [--scriptName scriptName] [...args] [--help]`);
        return;
    }
    ns.tail();
    let availRam = ns.getServerMaxRam(opts.server) - ns.getServerUsedRam(opts.server);
    ns.tprint(`availRam: ${availRam}`);
    let scriptRam = ns.getScriptRam(opts.scriptName, opts.server);
    ns.tprint(`scriptRam: ${scriptRam}`);
    if (scriptRam === 0) {
        ns.tprint(`ERROR: getScriptRam failed code 0, ${opts.scriptName} not found on ${opts.server}`);
        return;
    }
    let maxThreads = Math.floor(availRam / scriptRam);

    DBG1(ns, `host: ${opts.server} scriptName: ${opts.scriptName}`);
    DBG1(
        ns,
        `availRam: ${FNUM(ns, availRam)} scriptRam: ${FNUM(ns, scriptRam)}` +
            ` maxThreads: ${maxThreads} extra: ${opts._}`
    );
    //ns.run(opts.scriptName, maxThreads, opts.server)
    ns.exec(opts.scriptName, opts.server, maxThreads, ...opts._);
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    return [...data.servers, ...data.flags(schema)];
}
