const Color = {
    green: '\u001b[32m',
    cyan: '\u001b[36m',
    red: '\u001b[31m',
    reset: '\u001b[0m',
    white: '\u001b[37m',
};
const schema = [
    ['help', false], //
    ['targetServer', ''],
    ['delay'],
];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    console.log('opts :>> ', opts);

    if (opts.help || ns.args.length < 2) {
        ns.tprint(`usage: ${ns.getScriptName()} --targetServer SERVERNAME [--delay SEC] [--help]`);
        return;
    }

    const log = (s) => {
        ns.print(`${Color.cyan} [${new Date().toLocaleTimeString()}] ${Color.white} ${s} sec left ${Color.reset}`);
    };

    if (opts.delay) {
        let secLeft = Number.parseInt(opts.delay, 10);

        while (secLeft > 0) {
            ns.clearLog();
            // ns.disableLog('ALL');
            log(secLeft);
            // eslint-disable-next-line no-await-in-loop
            await ns.sleep(1000);
            secLeft -= 1;
        }
    }

    const startTime = new Date();
    ns.print(`startTime: ${new Date().toLocaleTimeString()}`);
    const securityLowered = await ns.weaken(opts.targetServer); // lowers sec by .05
    const endTime = new Date();
    ns.print(`INFO: endTime: ${new Date().toLocaleTimeString()}`);
    // const serverObj = ns.getServer(opts.targetServer);
    // ns.print(ll.ppJSON(serverObj));
    // document.querySelector("#terminal > li:nth-child(496) > div")
    // document.querySelector("#terminal > li:nth-child(496) > div > span")
    // <a class="MuiTypography-root MuiTypography-inherit MuiLink-root jss34 MuiLink-underlineAlways css-1q2f0gg"><p class="MuiTypography-root MuiTypography-body1 css-w0c39n">darkweb</p></a>
    ns.print(`securityLowered: ${securityLowered} elapsedSec: ${(endTime - startTime) / 1000}`);
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
