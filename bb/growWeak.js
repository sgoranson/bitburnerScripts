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

    const targetSrv = flags._[0];
    let cashAvail = ns.getServerMoneyAvailable(targetSrv);
    const cashMax = ns.getServerMaxMoney(targetSrv) * CASH_FRACTION;
    let secLvl = ns.getServerSecurityLevel(targetSrv);
    const secMinLvl = ns.getServerMinSecurityLevel(targetSrv) + SEC_OFFSET;
    const logPrefix = `${ns.getHostname()} -> ${targetSrv}:`;
     
    let earnedCash = 0;

    while (true) {
        INFO( `secLvl: ${secLvl} secMinLvl: ${secMinLvl} cashAvail: ${cashAvail} cashMax: ${cashMax} earnedCash: ${earnedCash}`);

        if (secLvl > secMinLvl) {
            INFO(`weak: secLvl: ${FNUM(secLvl)}`);
            secLvl -= await ns.weaken(targetSrv);

        } else if (cashAvail < cashMax) {
            INFO(`grow: cashAvail: ${FNUM(cashAvail)}`);
            cashAvail *= await ns.grow(targetSrv);

        } else {
            earnedCash += await ns.hack(targetSrv);
            INFO(`earnedCash: ${FNUM(earnedCash)}`);
        }
    }

    function INFO(str) {
        ns.print(`${logPrefix} ${str}`);
    }

    function FNUM(str) {
        return ns.formatNumber(str, 4, 1000, true);
    }
}
