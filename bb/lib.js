/* eslint-disable no-useless-escape */
/** @param {import(".").NS} ns  **/

export const logConfig = { debugFlag: false, ns: undefined };

export function INFO(ns, strx) {
    ns.tprint(`INFO: ${strx}`);
}
export function FNUM(ns, str) {
    return ns.formatNumber(str, 4, 1000, true);
}

export const calcScriptMaxThreads = (info) => {
    const { scriptName, serverName } = info;
    console.log('info :>> ', info);
    if (!logConfig.ns) {
        throw new Error('undefined NS ref');
    }

    const { ns } = logConfig;

    const availRam = ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName);
    const scriptRam = ns.getScriptRam(scriptName, serverName);
    if (scriptRam === 0) {
        throw new Error(`ERROR: getScriptRam failed code 0, ${scriptName} not found on ${serverName}`);
    }

    return Math.floor(availRam / scriptRam);
};
export const Color = {
    green: '\u001b[32m',
    cyan: '\u001b[36m',
    red: '\u001b[31m',
    reset: '\u001b[0m',
    white: '\u001b[37m',
};

export function DBG1(ns, str, termOnly = false) {
    if (!logConfig.debugFlag) return;

    ns.tprint(`${Color.cyan}DBG: [${new Date().toLocaleTimeString()}] ${str}${Color.reset}`);
    if (!termOnly) {
        ns.print(`${Color.cyan}DBG: [${new Date().toLocaleTimeString()}] ${str}${Color.reset}`);
    }
}
export const FMTN = Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format;

export function ppJSON(str) {
    return JSON.stringify(str, null, 2) // obj is the object you want to stringify
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, '\x1b[33m$1\x1b[0m')
        .replace(/"([^"]+)":/g, '\x1b[36m"$1"\x1b[0m:')
        .replace(/\b(true|false|null)\b/g, '\x1b[35m$1\x1b[0m');
}

//export function DBG(...args) {console.log(`DBG: [${(new Date()).toLocaleString()}] args: ${args.map(yy => [ Object.keys(yy)[0], Object.values(yy)[0] ] )
