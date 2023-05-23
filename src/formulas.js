import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['targetServer'],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    ll.logConfig.ns = ns;

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} threads cores  [--help]`);
        return;
    }
    /*
    const threads = Number(ns.args[0]);
    const cores = Number(ns.args[1]);
    const player = ns.getPlayer();
    const server = ns.getServer('ecorp');
    const gp = ns.formulas.hacking.growPercent(server, threads, player, cores);
    const gth = ns.formulas.hacking.growThreads(server, player, server.moneyMax, cores);
    const gt = ns.formulas.hacking.growTime(server, player);
    // const gt = ns.formulas.hacking.hackChance(server,player);
    // const gt = ns.formulas.hacking.hackExp(server,player);
    // const gt = ns.formulas.hacking.hackPercent(server,player);
    // const gt = ns.formulas.hacking.hackTime(server,player);
    // ns.formulas.hacking.weakenTime(server,player);
    ns.tprint(ll.ppJSON(player));
    ns.tprint(ll.ppJSON(server));
    ns.tprint(`INFO: growTime: ${ll.ppJSON(gt)}\n`);
    ns.tprint(`INFO: growThreads: ${gth}\n`);
    ns.tprint(`INFO: growPercent: ${ll.ppJSON(gp)}\n`);
*/
    const proggies = ['BruteSSH.exe', 'FTPCrack.exe', 'HTTPWorm.exe', 'SQLInject.exe', 'relaySMTP.exe'];
    const progCount = proggies.reduce((a, i) => (ns.ls('home', '.exe').includes(i) ? a + 1 : a), 0);
    ns.tprint(`INFO: progCount: ${ll.ppJSON(progCount)}\n`);
    //player.skills.hacking = 1;
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
