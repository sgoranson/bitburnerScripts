const schema = [['help', false]];

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const args = ns.flags([['help', false]]);
    if (args.help) {
        ns.tprint('This script will enhance your HUD (Heads up Display) with custom statistics.');
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint('Example:');
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    const FMT1 = new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format;

    const doc = eval('document'); // This is expensive! (25GB RAM) Perhaps there's a way around it? ;)
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');
    ns.tprint(FMT1(1123214));
    while (true) {
        try {
            const headers = [];
            const values = [];
            // Add script income per second
            headers.push('ScrInc');
            values.push(FMT1(ns.getTotalScriptIncome()[0]) + '/sec');
            // Add script exp gain rate per second
            headers.push('ScrExp');
            values.push(FMT1(ns.getTotalScriptExpGain()) + '/sec');
            // TODO: Add more neat stuff
            // Now drop it into the placeholder elements
            hook0.innerText = headers.join(' \n');
            hook1.innerText = values.join('\n');
        } catch (err) {
            // This might come in handy later
            ns.print('ERROR: Update Skipped: ' + String(err));
        }
        await ns.sleep(1000);
    }
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
