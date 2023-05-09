import { FNUM, DBG1, red, reset } from '/bb/lib.js';

const schema = [
    ['help', false],
    ['server', 'xyz'],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags(schema);
    if (flags.help) {
        ns.tprint(`usage: ${ns.getScriptName()}  SERVERNAME [--help] `);
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

    let totCash = 0;

    while (true) {
        cashAvail = ns.getServerMoneyAvailable(targetSrv);
        secLvl = ns.getServerSecurityLevel(targetSrv);

        DBG1(
            ns,
            `${logPrefix} secLvl: ${FNUM(ns, secLvl)} secMinLvl: ${secMinLvl} cashAvail: ${FNUM(ns, cashAvail)}` +
                ` cashMax: ${FNUM(ns, cashMax)} earnedCash: ${FNUM(ns, totCash)}`
        );

        if (secLvl > secMinLvl) {
            DBG1(ns, `${logPrefix} ${red}WEAK${reset}: secLvl: ${FNUM(ns, secLvl)}`);
            await ns.weaken(targetSrv);
        } else if (cashAvail < cashMax) {
            DBG1(ns, `${logPrefix} ${red}GROW${reset}: cashAvail: ${FNUM(ns, cashAvail)}`);
            await ns.grow(targetSrv);
        } else {
            let thisCash = await ns.hack(targetSrv);
            totCash += thisCash;
            DBG1(ns, `${logPrefix} ${red}HACK${reset}: thisCash: ${FNUM(ns, thisCash)} totCash: ${FNUM(ns, totCash)}`);
        }
    }
}
// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
