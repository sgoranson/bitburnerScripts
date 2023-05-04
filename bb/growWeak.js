import {FNUM, DBG1} from '/bb/lib.js';

const schema = [['help', false], ['server', 'xyz'] ];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags(schema);
    if (flags.help) {
        ns.tprint(`usage: ${ns.getScriptName()} --server SERVERNAME [--help] `);
        return;
    }

    const CASH_FRACTION = 0.75;
    const SEC_OFFSET = 5;

    ns.tail();

    const targetSrv = flags.server;
    let cashAvail = ns.getServerMoneyAvailable(targetSrv);
    const cashMax = ns.getServerMaxMoney(targetSrv) * CASH_FRACTION;
    let secLvl = ns.getServerSecurityLevel(targetSrv);
    const secMinLvl = ns.getServerMinSecurityLevel(targetSrv) + SEC_OFFSET;
    const logPrefix = `${ns.getHostname()} -> ${targetSrv}:`;
     
    let earnedCash = 0;

    while (true) {
        DBG1(ns, `${logPrefix} secLvl: ${FNUM(ns, secLvl)} secMinLvl: ${secMinLvl} cashAvail: ${FNUM(ns, cashAvail)}` + 
              ` cashMax: ${FNUM(ns, cashMax)} earnedCash: ${FNUM(ns,  earnedCash )}`);

        if (secLvl > secMinLvl) {
            DBG1(ns, `${logPrefix} weak: secLvl: ${FNUM(ns, secLvl)}`);
            secLvl -= await ns.weaken(targetSrv);

        } else if (cashAvail < cashMax) {
            DBG1(ns, `${logPrefix} grow: cashAvail: ${FNUM(ns, cashAvail)}`);
            cashAvail *= await ns.grow(targetSrv);

        } else {
            let gotCash = await ns.hack(targetSrv);
            earnedCash += gotCash;
            DBG1(ns, `${logPrefix} gotCash: ${FNUM(ns, gotCash)} earnedCash: ${FNUM(ns, earnedCash)}`);
        }
    }


}
// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
