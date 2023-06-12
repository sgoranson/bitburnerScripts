/* eslint-disable no-unused-vars */
import * as ll from './lib.js';

const schema = [
    ['help', false], //
    ['list', false], //
];

const totalWeakenTime = (threads, hackSkill, diffCur, diffLo) => {};

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    ll.logConfig.ns = ns;

    if (opts.help || ns.args.length < 7) {
        return;
    }
    ns.tprint(
        `usage: ${ns.getScriptName()} difflo-1 diffcur-2 mySkill-3 ` + //
            'reqSkill-4 moneyAvail-5 moneyMax-6 threads-7 [--help] [--list]'
    );

    let threads = 1;
    const cores = 1;
    const mySkill = 1;
    const player = ns.getPlayer();
    const mServ = ns.formulas.mockServer();
    ns.tprint(`player.skill.hacking:  ${player.skills.hacking}`);
    // eslint-disable-next-line no-undef
    [
        mServ.minDifficulty,
        mServ.hackDifficulty,
        player.skills.hacking,

        mServ.requiredHackingSkill,
        mServ.moneyAvailable,
        mServ.moneyMax,
        threads,
    ] = ns.args;

    if (opts.list) {
        const servers = ll.treeScan(ns);
        const rows = [];
        for (const s of servers) {
            const etc = {};
            etc.hn = s.hostname.padEnd(20);
            etc.pHackSkill = player.skills.hacking;
            etc.minDiff = s.minDifficulty;
            etc.hackDiff = s.hackDifficulty;
            etc.reqHack = s.requiredHackingSkill;
            etc.cashHackedT1 = ns.formulas.hacking.hackPercent(s, player) * s.moneyAvailable;
            etc.hackTime = ns.formulas.hacking.hackTime(s, player) / 1000 / 60;
            // etc.weakTime = ns.formulas.hacking.weakenTime(s, player);
            etc.cashPerMin = etc.cashHackedT1 / etc.hackTime;
            // etc.growT = ns.formulas.hacking.growThreads(s, player, Infinity, cores);
            // etc.growPercentT1 = ns.formulas.hacking.growPercent(s, 1, player, cores);
            // etc.growPercentT1k = ns.formulas.hacking.growPercent(s, 1e3, player, cores);
            // etc.diff = s.hackDifficulty - s.minDifficulty;
            etc.moneyAvail = s.moneyAvailable;
            rows.push(etc);
        }
        rows.sort((a, b) => b.cashPerMin - a.cashPerMin).forEach((r) => ns.tprint(ll.ppRow(r)));
    }
    const out = {
        hackTime: ns.formulas.hacking.hackTime(mServ, player),
        growTime: ns.formulas.hacking.growTime(mServ, player),
        weakenTime: ns.formulas.hacking.weakenTime(mServ, player),
    };

    ns.tprint(ll.ppRow(out));
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
