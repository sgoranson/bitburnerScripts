/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags([
        ['help', false],
        ['json', true],
    ]);

    if (flags.help) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME [--help] [--json]`);
        return;
    }

    //ns.tail();

    let jsonServers = [];
    let visitedServers = new Set();

    if (!flags.json) {
        let headerStr = `${Object.keys(ns.getServer('home'))},fullpath`;
        ns.tprint(`${headerStr} \n `);
        ns.write('servers.txt', `${headerStr} \n `, 'a');
    } 


    function scanThis(node) {
        visitedServers.add(node);
        let ss = ns.getServer(node);
        ss.path = Array.from(visitedServers).join(':');

        if (!flags.json) {
            ns.tprint(`${Object.values(ss)} \n `);
            ns.write('/servers.txt', `${Object.values(ss)} \n`, 'a');
        } else {
            jsonServers.push(ss);
        }

        let connectedServers = ns.scan(node);
        //ns.tprint(`node: ${node}`);

        for (const s of connectedServers) {

            if (!visitedServers.has(s)) {
                scanThis(s);
            }
        }
    }

    scanThis(flags._[0]);
    ns.write('/allServers.txt', JSON.stringify(jsonServers));
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, args) {
    return [...data.servers];
}
