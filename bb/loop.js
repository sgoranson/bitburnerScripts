/* eslint-disable no-await-in-loop */
import * as ll from '/bb/lib.js';

ll.logConfig.debugFlag = false;

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
    const CASH_FRACTION = 0.95;
    const SEC_OFFSET = 2;

    ns.tail();

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

        ll.DBG1(
            ns,
            `${logPrefix} secLvl: ${ll.FNUM(ns, secLvl)} secMinLvl: ${secMinLvl} cashAvail: ${ll.FNUM(ns, cashAvail)}` +
                ` cashMax: ${ll.FNUM(ns, cashMax)} earnedCash: ${ll.FNUM(ns, totCash)}`
        );

        if (secLvl > secMinLvl) {
            ll.DBG1(ns, `${logPrefix} ${ll.red}WEAK${ll.reset}: secLvl: ${ll.FNUM(ns, secLvl)}`);
            await ns.weaken(targetServer);
        } else if (cashAvail < cashMax) {
            ll.DBG1(ns, `${logPrefix} ${ll.red}GROW${ll.reset}: cashAvail: ${ll.FNUM(ns, cashAvail)}`);
            await ns.grow(targetServer);
        } else {
            const thisCash = await ns.hack(targetServer);
            totCash += thisCash;
            ll.DBG1(
                ns,
                `${logPrefix} ${ll.red}HACK${ll.reset}: thisCash: ${ll.FNUM(ns, thisCash)} totCash: ${ll.FNUM(
                    ns,
                    totCash
                )}`
            );
        }
    }
}
// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
