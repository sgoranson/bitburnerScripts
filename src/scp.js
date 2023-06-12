/* eslint-disable no-restricted-syntax */
/* eslint-disable require-jsdoc */

import * as ll from './lib.js';

const SERVERFN = 'srv1.txt';

/** @param {import(".").NS} ns  **/
function readLines(ns, filename) {
    const fullStr = ns.read(filename);
    const strz = fullStr
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    ll.INFO(ns, `fullStr: ${fullStr} strz: ${strz}`);

    return strz;
}
/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags([['help', false]]);
    if (flags.help) {
        ll.INFO(ns, `usage: ${ns.getScriptName()} [...files] [--help]`);
        return;
    }

    const destServers = readLines(ns, SERVERFN).filter((s) => ns.serverExists(s));
    //const destServers = ['earl2', 'omega-net'];
    const files2copy = flags._.length ? flags._ : ns.ls(ns.getHostname(), '.js');

    ll.INFO(ns, `INFO: copying: ${files2copy}`);
    ll.INFO(ns, `to: ${destServers.join(':')}`);

    for (const server of destServers) {
        ll.INFO(ns, `scp to (${server})`);
        ll.INFO(ns, `dest: (${server}) sz: ${server.length}`);
        if (ns.scp(files2copy, server, 'home')) {
            ns.tprint(`SUCCESS: OK: ${server}`);
        } else {
            ll.INFO(ns, `ERROR: FAIL: ${server}`);
        }
    }
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _) {
    return [...data.scripts, 'xx'];
}
