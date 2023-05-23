/** @param {import(".").NS} ns  **/
const xpGoal = 2.6e6;
let xpRate = 30;

const xpTime = (r, n) => n / r / 3600;

let gains = 0;
let hours = 0;

do {
    gains += xpRate * 3600;
    xpRate *= 1.3;
    hours += 1;
} while (gains < xpGoal);
console.log('gains :>> ', gains);
console.log('xpRate :>> ', xpRate);
console.log('hours :>> ', hours);
console.log('xpTime(30,xpGoal) :>> ', xpTime(30, xpGoal));
