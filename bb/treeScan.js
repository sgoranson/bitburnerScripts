//import {FNUM, DBG1, red, reset} from '/bb/lib.js';

const schema = [
    ['help', false],
    ['json', true],
    ['c', ''],
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

    const jsonServers = [];
    const visitedServers = new Set();

    if (!flags.json) {
        const headerStr = `${Object.keys(ns.getServer('home'))},fullpath`;
        ns.tprint(`${headerStr} \n `);
        ns.write('servers.txt', `${headerStr} \n `, 'a');
    }

    const V = new Map();

    function scanThis(node) {
        visitedServers.add(node);
        const ss = ns.getServer(node);
        ss.path = Array.from(visitedServers).join(':');

        ss.connectedServers = ns.scan(node);
        V.set(node, ss.connectedServers);

        if (!flags.json) {
            ns.tprint(`${Object.values(ss)} \n `);
            ns.write('/servers.txt', `${Object.values(ss)} \n`, 'a');
        } else {
            jsonServers.push(ss);
        }

        ss.connectedServers.forEach((s) => {
            if (!visitedServers.has(s)) {
                scanThis(s);
            }
        });
    }

    scanThis(flags._[0]);
    ns.write('/allServersJson.txt', JSON.stringify(jsonServers));

    function findPath(startName, targetName) {
        //ns.tprint(`targetName: ${targetName}`);

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

    //findPath('sigma-cosmetics');
    const serversNpaths = jsonServers.map((srv) => ({
        ...srv,
        path: findPath('home', srv.hostname),
    }));

    if (flags.c !== '') {
        const [{ path }] = serversNpaths.filter((s) => s.hostname === flags.c);
        console.log('path :>> ', path);
        ns.tprint(path.join(';connect '));

        // eslint-disable-next-line no-eval
        const doc = eval('document');
        const terminalInput = doc.getElementById('terminal-input');
        terminalInput.value = path.join(';connect ');

        // Get a reference to the React event handler.
        const handler = Object.keys(terminalInput)[1];

        // Perform an onChange event to set some internal values.
        terminalInput[handler].onChange({ target: terminalInput });

        // Simulate an enter press
        terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });
    } else {
        serversNpaths
            .filter((s) => s.requiredHackingSkill <= myHackLvl)
            .sort((a, b) => b.moneyMax - a.moneyMax)
            .slice(0, 10)
            .map(({ hostname, moneyMax, requiredHackingSkill, serverGrowth, path, numOpenPortsRequired }) => ({
                hostname: hostname.padStart(15),
                moneyMax: moneyMax.toString().padStart(15),
                requiredHackingSkill: requiredHackingSkill.toString().padStart(5),
                serverGrowth: serverGrowth.toString().padStart(5),
                numOpenPortsRequired: numOpenPortsRequired.toString().padStart(5),
                // connectedServers: connectedServers.toString().padStart(10),
                path: path.join(';connect ').padStart(10),
            }))
            .forEach((s) => ns.tprint(s));
    }
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, args) {
    data.flags(schema);
    return [...data.servers];
}
