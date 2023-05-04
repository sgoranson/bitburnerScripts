/* eslint-disable require-jsdoc */
'use strict';

import * as ll from '/bb/lib.js';

const SERVERFN = '/bb/srv1.txt';

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags([['help', false]]);
    if (flags.help) {
        ll.INFO(ns, `usage: ${ns.getScriptName()} [...files] [--help]`);
        return;
    }

    ns.tail(); //yes

    const destServers = readLines(ns, SERVERFN);
    //const destServers = ['earl2', 'omega-net'];
    const files2copy = flags._.length ? flags._ : ns.ls(ns.getHostname(), '/bb');

    ll.INFO(ns, `INFO: copying: ${files2copy}`);
    ll.INFO(ns, `to: ${destServers.join(':')}`);

    for (let server of destServers) {
        ll.INFO(ns, `scp to (${server})`);
        ll.INFO(ns, `dest: (${server}) sz: ${server.length}`);
        if (ns.scp(files2copy, server, 'home')) {
            ns.tprint(`SUCCESS: OK: ${server}`);
        } else {
            ll.INFO(ns, `ERROR: FAIL: ${server}`);
        }
    }
}

/** @param {import(".").NS} ns  **/
function readLines(ns, filename) {
    let fullStr = ns.read(filename);
    let strz = fullStr
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    ll.INFO(ns, `fullStr: ${fullStr} strz: ${strz}`);

    return strz;
}
// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _) {
    return [...data.scripts, 'xx'];
}
