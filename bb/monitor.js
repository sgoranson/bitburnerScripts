/** @param {NS} ns */

export async function main(ns) {
    const flags = ns.flags([
        ['infoOnly', false],
        ['help', false],
    ]);
    if (flags._.length === 0 || flags.help) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME [--help] [--infoOnly]`);
        return;
    }

    const CASH_FRACTION = 0.75;
    const SEC_OFFSET = 5;

    ns.tail();

    let srv = flags._[0];
    let ports = ns.getServerNumPortsRequired(srv);
    let cashAvail = ns.getServerMoneyAvailable(srv);
    let cashMax = ns.getServerMaxMoney(srv);
    let secLvl = ns.getServerSecurityLevel(srv);
    let secMinLvl = ns.getServerMinSecurityLevel(srv);

    // how much we need to grow
    let growFrac = (cashMax * CASH_FRACTION) / cashAvail;
    // number of times grow needs to be called
    let growCount = Math.floor(ns.growthAnalyze(srv, growFrac));
    let growTime = ns.getGrowTime(srv);
    let growTotTime = growCount * growTime;

    // size of weaken per call
    let weakAmt = ns.weakenAnalyze(1);
    // total times weaken needs to be called
    let weakCount = Math.floor((secLvl - (secMinLvl + SEC_OFFSET)) / weakAmt);
    let weakTotTime = ns.getWeakenTime(srv) * weakCount;

    ns.print(
        `${srv} : growFrac: ${growFrac.toFixed(1)} growCount: ${growCount} growTime: ${ns.tFormat(growTime)} growTotTime: ${ns.tFormat(
            growTotTime
        )}`
    );
    ns.print(`${srv}: weakAmt: ${weakAmt.toFixed(1)} weakCount: ${weakCount} weakTotTime: ${ns.tFormat(weakTotTime)}`);
    ns.print(`${srv}: ports req: ${ports}`);
    ns.print(`${srv}: money avail: ${cashAvail}`);
    ns.print(`${srv}: max money: ${cashMax}`);
    ns.print(`${srv}: sec lvl: ${secLvl}`);
    ns.print(`${srv}: sec min lvl: ${secMinLvl}`);
    ns.print(' ');
}

export function autocomplete(data, args) {
    return data.servers;
}
