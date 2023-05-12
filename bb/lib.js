/** @param {import(".").NS} ns  **/

export function INFO(ns, strx) {
    ns.tprint(`INFO: ${strx}`);
}
export function FNUM(ns, str) {
    return ns.formatNumber(str, 4, 1000, true);
}

// const green = "\u001b[32m";
export const cyan = '\u001b[36m';
export const red = '\u001b[31m';
export const reset = '\u001b[0m';

export const logConfig = { debugFlag: false };

export function DBG1(ns, str, termOnly = false) {
    if (!logConfig.debugFlag) return;

    ns.tprint(`${cyan}DBG: [${new Date().toLocaleTimeString()}] ${str}${reset}`);
    if (!termOnly) {
        ns.print(`${cyan}DBG: [${new Date().toLocaleTimeString()}] ${str}${reset}`);
    }
}

//export function DBG(...args) {console.log(`DBG: [${(new Date()).toLocaleString()}] args: ${args.map(yy => [ Object.keys(yy)[0], Object.values(yy)[0] ] )
