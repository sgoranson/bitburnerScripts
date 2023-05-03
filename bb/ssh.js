/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.brutessh(ns.args[0]);
}