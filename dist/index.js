var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { calculators, Direction, Duration, Mode, } from "@dfinity/icp-calculator";
function getDailyCostsEclipse() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch("https://api.celenium.io/v1/rollup/day?limit=100&offest=100", {
                "credentials": "include",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-GB,en;q=0.5",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none",
                    "Sec-Fetch-User": "?1",
                    "Priority": "u=0, i"
                },
                "method": "GET",
                "mode": "cors"
            });
            const dailyCosts = yield res.json();
            const dailyCostsEclipse = dailyCosts.find(cost => cost.slug === "eclipse");
            if (dailyCostsEclipse === null) {
                throw Error("cannot find the results for eclipse");
            }
            return dailyCostsEclipse;
        }
        catch (err) {
            console.error(err);
        }
    });
}
function getCelestiaPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch("https://api-mainnet.celenium.io/v1/stats/price/current", {
                "credentials": "omit",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
                    "Accept": "*/*",
                    "Accept-Language": "en-GB,en;q=0.5",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    "Priority": "u=4"
                },
                "referrer": "https://celenium.io/",
                "method": "GET",
                "mode": "cors"
            });
            const prices = yield res.json();
            return prices.high;
        }
        catch (err) {
            console.error(err);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const eclipseCosts = yield getDailyCostsEclipse();
        const celestiaPrice = yield getCelestiaPrice();
        const timeSpan = 30;
        const totalSize = eclipseCosts.total_size;
        const messageCount = eclipseCosts.pfb_count;
        const averageMessageSize = totalSize / messageCount;
        const pricePerPFB = parseFloat(eclipseCosts.fee_per_pfb);
        const $ = calculators().calculatorUSD;
        const storage = $.storage(totalSize * timeSpan, Duration.fromDays(timeSpan));
        const execute = $.execution(Mode.Replicated, 1000000);
        const send = $.message(Mode.Replicated, Direction.UserToCanister, averageMessageSize);
        return ({
            date: (new Date()).toISOString(),
            dailyStorageSize: `${totalSize / 1000000000}GB`,
            timePeriodForStorage: timeSpan,
            ingressMessageCount: messageCount,
            totalCostInUSD: {
                ic: storage + ((execute + send) * messageCount * timeSpan),
                celestia: celestiaPrice * pricePerPFB * messageCount / 1000000 * timeSpan
            }
        });
    });
}
main().then(res => console.log(JSON.stringify(res))).catch(err => console.error(err));
