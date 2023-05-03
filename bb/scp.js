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

    ns.tail();

    const dest = readLines(ns, SERVERFN);
    const files = flags._.length ? flags._ : ns.ls(ns.getHostname(), '/bb');

    ll.INFO(ns, `INFO: copying: ${files}`);
    ll.INFO(ns, `to: ${dest}`);

    for (let s of dest) {
        if (ns.scp(flags._, s, 'home')) {
            ns.tprint(`SUCCESS: OK: ${s}`);
        } else {
            ll.INFO(ns, `ERROR: FAIL: ${s}`);
        }
    }
}

/** @param {import(".").NS} ns  **/
function readLines(ns, filename) {
    fullStr = ns.read(filename);
    let strz = fullStr.split('\n');
    ll.INFO(ns, `fullStr: ${fullStr} strz: ${strz}`);

    return strz;
}
export function autocomplete(data, args) {
    return [...data.scripts, 'xx'];
}
