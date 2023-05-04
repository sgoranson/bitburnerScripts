import {FNUM, DBG1} from '/bb/lib.js';

const hostname = 'home';
const scriptName = '/bb/growWeak.js';
const schema = [['help', false], ['server', hostname], ['script', scriptName]];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} [--server SERVERNAME] [--script scriptName] [--help]`);
        return;
    }

    
  

    let availRam = ns.getServerMaxRam(opts.server) -  ns.getServerUsedRam(opts.server);
    let scriptRam = ns.getScriptRam(opts.script, opts.server);
    let maxThreads = Math.floor(availRam / scriptRam);

    DBG1(ns, `host: ${opts.server} scriptName: ${opts.script}`);
    DBG1(ns, `availRam: ${FNUM(ns, availRam)} scriptRam: ${FNUM(ns, scriptRam)} maxThreads: ${maxThreads}`);
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
