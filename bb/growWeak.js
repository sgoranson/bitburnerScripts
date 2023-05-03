/** @param {import(".").NS} ns  **/

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

    let targetSrv = flags._[0];
    let cashAvail = ns.getServerMoneyAvailable(targetSrv);
    let cashMax = ns.getServerMaxMoney(targetSrv);
    let secLvl = ns.getServerSecurityLevel(targetSrv);
    let secMinLvl = ns.getServerMinSecurityLevel(targetSrv);
    let logPrefix = `${ns.getHostname()} -> ${targetSrv}:`;
    let earnedCash = 0;

    while (true) {
        if (secLvl > secMinLvl + SEC_OFFSET) {
            ns.print(`${logPrefix} secLvl: ${FNUM(secLvl)}`);
            secLvl -= await ns.weaken(targetSrv);
        } else if (cashAvail < cashMax * CASH_FRACTION) {
            ns.print(`${logPrefix}: grow: cashMax: ${FNUM(cashMax * CASH_FRACTION)} cashAvail: ${FNUM(cashAvail)}`);
            cashAvail *= await ns.grow(targetSrv);
        } else {
            earnedCash += await ns.hack(targetSrv);
            ns.print(`${logPrefix}: earnedCash: ${FNUM(earnedCash)}`);
        }
    }

    function FNUM(str) {
        return ns.formatNumber(str, 4, 1000, true);
    }
}
