let V = new Map([
    ['b', ['e', 'f']], //
    ['a', ['b', 'c', 'd']],
    ['c', []],
    ['e', []],
    ['f', []],
    ['g', []],
    ['d', ['g', 'h']],
]);

let parents = Object.create(null);

function findPath2(startName, targetName) {
    console.log(`targetName: ${targetName}`);

    let visited = [];
    let nodeQ = [];

    parents[startName] = undefined;

    visited.push(startName);
    nodeQ.push(startName);

    while (nodeQ.length > 0) {
        let thisNode = nodeQ.shift();
        // paths.push(paths.slice(-1)[0]);
        // let currentPath = paths[paths.length - 1];
        // currentPath.push(node);

        let edges = V.get(thisNode) ?? [];
        console.log(
            ` thisNode: ${thisNode.toString().padStart(15)} ` +
                `edges: ${edges.toString().padStart(10)} ` +
                ` visited: ${visited.toString().padStart(20)} nodeQ: ${nodeQ.toString().padStart(20)}`
        );

        for (const e of edges) {
            if (!visited.includes(e)) {
                parents[e] = thisNode;

                visited.push(e);
                nodeQ.push(e);
            }
        }
    }

    let ret = [];
    let n = targetName;

    if (Object.keys(parents).includes(targetName)) {
        ret.push(n);
        let p = parents[n];
        while (p) {
            ret.push(p);
            n = p;
            p = parents[n];
        }
        ret.reverse();
        return ret;
    } else {
        return [];
    }
}
// eslint-disable-next-line no-unused-vars
function findPath(startName, targetName) {
    console.log(`targetName: ${targetName}`);

    let visited = [];
    let pathQ = [];

    visited.push(startName);
    pathQ.push([startName]);

    while (pathQ.length > 0) {
        let thisPath = pathQ.shift();

        // paths.push(paths.slice(-1)[0]);
        // let currentPath = paths[paths.length - 1];
        // currentPath.push(node);

        if (thisPath[thisPath.length - 1] === targetName) {
            return thisPath;
        }

        let edges = V.get(thisPath[thisPath.length - 1]);
        console.log(
            ` thisPath: ${thisPath.toString().padStart(15)} ` +
                `edges: ${edges.toString().padStart(10)} ` +
                ` visited: ${visited.toString().padStart(20)} pathQ: ${pathQ
                    .map((x) => x.join(':'))
                    .toString()
                    .padStart(20)}`
        );

        for (const e of edges) {
            if (!visited.includes(e)) {
                let newPath = thisPath.slice();
                newPath.push(e);
                visited.push(e);
                pathQ.push(newPath);
            }
        }
    }

    return [];
}
console.log(findPath2('a', 'g'));
