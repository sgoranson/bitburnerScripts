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

export function l337(ns, targetServer) {
    if (!ns.serverExists(targetServer)) {
        ns.tprint(`ERROR: ${targetServer} no existe`);
        return;
    }

    const files = ns.ls('home');
    if (files.includes('BruteSSH.exe')) {
        ns.brutessh(targetServer);
    }
    if (files.includes('FTPCrack.exe')) {
        ns.ftpcrack(targetServer);
    }
    if (files.includes('HTTPWorm.exe')) {
        ns.httpworm(targetServer);
    }
    if (files.includes('SQLInject.exe')) {
        ns.sqlinject(targetServer);
    }
    if (files.includes('relaySMTP.exe')) {
        ns.relaysmtp(targetServer);
    }
    if (files.includes('NUKE.exe')) {
        ns.nuke(targetServer);
    }
}

export function treeScan(ns) {
    const root = 'home';

    const jsonServers = [];
    const visitedServers = new Set();

    const V = new Map();

    function scanThis(node) {
        visitedServers.add(node);
        const ss = ns.getServer(node);
        ss.path = Array.from(visitedServers).join(':');

        ss.connectedServers = ns.scan(node);
        V.set(node, ss.connectedServers);

        jsonServers.push(ss);

        ss.connectedServers.forEach((s) => {
            if (!visitedServers.has(s)) {
                scanThis(s);
            }
        });
    }

    function findPath(startName, targetName) {
        const visited = [];
        const pathQ = [];

        visited.push(startName);
        pathQ.push([startName]);

        while (pathQ.length > 0) {
            const thisPath = pathQ.shift();

            if (thisPath[thisPath.length - 1] === targetName) {
                return thisPath;
            }

            const edges = V.get(thisPath[thisPath.length - 1]);

            edges.forEach((e) => {
                if (!visited.includes(e)) {
                    const newPath = thisPath.slice();
                    newPath.push(e);
                    visited.push(e);
                    pathQ.push(newPath);
                }
            });
        }

        return [];
    }

    scanThis(root);

    return jsonServers.map((srv) => ({
        ...srv,
        path: findPath(root, srv.hostname),
    }));
}

//export function DBG(...args) {console.log(`DBG: [${(new Date()).toLocaleString()}] args: ${args.map(yy => [ Object.keys(yy)[0], Object.values(yy)[0] ] )
