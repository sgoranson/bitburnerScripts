/* eslint-disable no-await-in-loop */
import { FNUM, DBG1, red, reset } from '/bb/lib.js';

const schema = [
    ['help', false],
    ['targetServer', ''],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const flags = ns.flags(schema);
    if (flags.help || flags.length < 2 || flags.targetServer === '') {
        ns.tprint(`usage: ${ns.getScriptName()}  --targetServer SERVERNAME [--help] `);
        return -1;
    }
    console.log('growWeak flags :>> ', flags);
    const CASH_FRACTION = 0.75;
    const SEC_OFFSET = 5;

    // ns.tail();

    const { targetServer } = flags;
    let cashAvail = ns.getServerMoneyAvailable(targetServer);
    const cashMax = ns.getServerMaxMoney(targetServer) * CASH_FRACTION;
    let secLvl = ns.getServerSecurityLevel(targetServer);
    const secMinLvl = ns.getServerMinSecurityLevel(targetServer) + SEC_OFFSET;
    const logPrefix = `${ns.getHostname()} -> ${targetServer}:`;

    let totCash = 0;

    while (true) {
        cashAvail = ns.getServerMoneyAvailable(targetServer);
        secLvl = ns.getServerSecurityLevel(targetServer);

        DBG1(
            ns,
            `${logPrefix} secLvl: ${FNUM(ns, secLvl)} secMinLvl: ${secMinLvl} cashAvail: ${FNUM(ns, cashAvail)}` +
                ` cashMax: ${FNUM(ns, cashMax)} earnedCash: ${FNUM(ns, totCash)}`
        );

        if (secLvl > secMinLvl) {
            DBG1(ns, `${logPrefix} ${red}WEAK${reset}: secLvl: ${FNUM(ns, secLvl)}`);
            await ns.weaken(targetServer);
        } else if (cashAvail < cashMax) {
            DBG1(ns, `${logPrefix} ${red}GROW${reset}: cashAvail: ${FNUM(ns, cashAvail)}`);
            await ns.grow(targetServer);
        } else {
            const thisCash = await ns.hack(targetServer);
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
