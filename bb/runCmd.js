const schema = [['help', false]];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    if (opts.help) {
        ns.tprint(`usage: ${ns.getScriptName()} SERVERNAME [--help]`);
        return;
    }

    const TMPFILE = 'tmp.js';
    let runStr = ` export async function main(ns) {ns.tprint(JSON.stringify(${ns.args.join(' ')},null,"\t")) } `;
    ns.write(TMPFILE, runStr, 'w');
    ns.run(TMPFILE);
    //ns.tprint(`${eval(ns.args.join(' '))}`);
}
// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
