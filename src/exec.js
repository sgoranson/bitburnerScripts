import * as ll from 'lib.js';

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    ll.logConfig.ns = ns;

    if (ns.args.includes('--help') || ns.args.length < 2) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME script threads [...args] [--farm] [--kill] [--help]`);
        return;
    }

    let farm = false;
    let kill = false;
    if (ns.args.includes('--farm')) {
        ns.args.splice(ns.args.indexOf('--farm'), 1);
        farm = true;
    }
    if (ns.args.includes('--kill')) {
        ns.args.splice(ns.args.indexOf('--kill'), 1);
        kill = true;
    }
    // eslint-disable-next-line prefer-const
    let [serverName, scriptName, threads, prefix, args] = ns.args;
    args ??= [];

    scriptName = scriptName.replace('./', '');

    if (farm) {
        // [...Array(25)].forEach((s, i) => {
        [...Array(25)]
            .map((s, i) => `${prefix}${i}`)
            .filter((s) => ns.serverExists(s))
            .forEach((s) => {
                try {
                    if (kill) {
                        ns.killall(s);
                    } else {
                        ns.exec(scriptName, s, threads, ...args);
                    }
                } catch (error) {
                    ns.tprint(`ERROR: ${String(error)}`);
                }
            });
    } else {
        ns.exec(scriptName, serverName, threads, ...args);
    }

    ns.tprint(ns.getScriptLogs().join('\n'));
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, args) {
    if (args.length <= 1) {
        return [...data.servers];
    }
    return [...data.scripts];
}
