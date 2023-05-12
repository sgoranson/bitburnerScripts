const schema = [
    ['help', false], //
    ['targetServer', ''],
    ['threadCount', 1],
    ['multiplier', 2.0],
    ['moneyTarget', 100e5],
];

const ezNum = new Intl.NumberFormat('en-US', { notation: 'compact' }).format;

/** @param {import(".").NS} ns  **/

export async function main(ns) {
    const opts = ns.flags(schema);

    if (opts.help || opts.targetServer === '' || ns.args.length < 1) {
        ns.tprint(
            `usage: ${ns.getScriptName()} [--multiplier x.x] [--threadCount x] [--targetServer x] [--moneyTarget x] [--help]`
        );
        return;
    }

    //ns.tail();

    const pad = 50;

    ns.tprint(
        ` ns.hackAnalyze(${opts.targetServer}) => `.padEnd(pad),
        ezNum(ns.hackAnalyze(opts.targetServer)),
        ' (% of cash/hack)'
    );
    ns.tprint(
        ' ns.hackAnalyzeChance(opts.targetServer) => '.padEnd(pad),
        ezNum(ns.hackAnalyzeChance(opts.targetServer)),
        ' % chance to hack'
    );
    ns.tprint(
        ` ns.hackAnalyzeSecurity(${opts.threadCount},opts.targetServer) => `.padEnd(pad),
        ns.hackAnalyzeSecurity(opts.threadCount, opts.targetServer),
        ` (sec raise/ ${opts.threadCount} hack threads)`
    );
    const hackThreads = ns.hackAnalyzeThreads(opts.targetServer, opts.moneyTarget);
    const hackCashPerThread = (opts.moneyTarget * 1) / hackThreads;
    ns.tprint(
        ` ns.hackAnalyzeThreads(${opts.targetServer},${opts.moneyTarget}) => `.padEnd(pad),
        ezNum(hackThreads),
        ` threads / ${opts.moneyTarget} (${ezNum(hackCashPerThread)} cash / 1 thread)`
    );
    ns.tprint(
        ` ns.growthAnalyze(opts.targetServer,${opts.multiplier}) => `.padEnd(pad),
        ezNum(ns.growthAnalyze(opts.targetServer, opts.multiplier)),
        ` threads / ${opts.multiplier} grow`
    );
    ns.tprint(
        ` ns.growthAnalyzeSecurity(${opts.threadCount},opts.targetServer) => `.padEnd(pad),
        ns.growthAnalyzeSecurity(opts.threadCount, opts.targetServer),
        ` sec gain / ${opts.threadCount} thread`
    );
    ns.tprint(
        ` ns.weakenAnalyze(${opts.threadCount}) => `.padEnd(pad),
        ns.weakenAnalyze(opts.threadCount),
        ` sec loss / ${opts.threadCount} thread`
    );
    ns.tprint(' ns.getGrowTime(opts.targetServer)/1k => '.padEnd(pad), ns.getGrowTime(opts.targetServer) / 1000);
    ns.tprint(' ns.getHackTime(opts.targetServer)/1k => '.padEnd(pad), ns.getHackTime(opts.targetServer) / 1000);
    ns.tprint(' ns.getWeakenTime(opts.targetServer)/1k => '.padEnd(pad), ns.getWeakenTime(opts.targetServer) / 1000);
    ns.tprint(JSON.stringify(ns.getServer(opts.targetServer), null, '\t'));
    //const srv = flags._[0];
}

// eslint-disable-next-line no-unused-vars
export function autocomplete(data, _args) {
    data.flags(schema);
    return [...data.servers];
}
