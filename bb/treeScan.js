//import {FNUM, DBG1, red, reset} from '/bb/lib.js';

const schema = [
    ['help', false],
    ['json', true],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags(schema);

    if (flags.help) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME [--help] [--json]`);
        return;
    }

    //ns.tail();
    const myHackLvl = ns.getHackingLevel();

    let jsonServers = [];
    let visitedServers = new Set();

    if (!flags.json) {
        let headerStr = `${Object.keys(ns.getServer('home'))},fullpath`;
        ns.tprint(`${headerStr} \n `);
        ns.write('servers.txt', `${headerStr} \n `, 'a');
    }

    let V = new Map();

    function scanThis(node) {
        visitedServers.add(node);
        let ss = ns.getServer(node);
        ss.path = Array.from(visitedServers).join(':');

        ss.connectedServers = ns.scan(node);
        V.set(node, ss.connectedServers);

        if (!flags.json) {
            ns.tprint(`${Object.values(ss)} \n `);
            ns.write('/servers.txt', `${Object.values(ss)} \n`, 'a');
        } else {
            jsonServers.push(ss);
        }

        for (const s of ss.connectedServers) {
            if (!visitedServers.has(s)) {
                scanThis(s);
            }
        }
    }

    scanThis(flags._[0]);
    ns.write('/allServersJson.txt', JSON.stringify(jsonServers));

    function findPath(startName, targetName) {
        //ns.tprint(`targetName: ${targetName}`);

        let visited = [];
        let pathQ = [];

        visited.push(startName);
        pathQ.push([startName]);

        while (pathQ.length > 0) {
            let thisPath = pathQ.shift();

            if (thisPath[thisPath.length - 1] === targetName) {
                return thisPath;
            }

            let edges = V.get(thisPath[thisPath.length - 1]);
            // ns.tprint(
            //     ` thisPath: ${thisPath.toString().padStart(15)} ` +
            //         `edges: ${edges.toString().padStart(10)} ` +
            //         ` visited: ${visited.toString().padStart(20)} pathQ: ${pathQ
            //             .map((x) => x.join(':'))
            //             .toString()
            //             .padStart(20)}`
            // );

            for (const e of edges) {
                if (!visited.includes(e)) {
                    let newPath = thisPath.slice();
                    newPath.push(e);
                    visited.push(e);
                    pathQ.push(newPath);
                }
            }
        }

        return [];
    }

    //findPath('sigma-cosmetics');
    jsonServers.forEach((srv) => (srv.path = findPath('home', srv.hostname)));
    jsonServers
        .filter((s) => s.requiredHackingSkill <= myHackLvl)
        .sort((a, b) => b.moneyMax - a.moneyMax)
        .slice(0, 10)
        .map(({ hostname, moneyMax, requiredHackingSkill, serverGrowth, path }) => ({
            hostname: hostname.padStart(15),
            moneyMax: moneyMax.toString().padStart(15),
            requiredHackingSkill: requiredHackingSkill.toString().padStart(5),
            serverGrowth: serverGrowth.toString().padStart(5),
            // connectedServers: connectedServers.toString().padStart(10),
            path: path.toString().padStart(10),
        }))
        .forEach((s) => ns.tprint(s));
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, args) {
    data.flags(schema);
    return [...data.servers];
}
