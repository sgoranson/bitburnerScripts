/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.nuke(ns.args[0]);
}