import {
	calculators,
	Direction,
	Duration,
	Mode,
} from "@dfinity/icp-calculator";
import type { Bytes, Instructions } from "@dfinity/icp-calculator";

async function getDailyCostsEclipse() {
	try {
		const res = await fetch("https://api.celenium.io/v1/rollup/day?limit=100&offest=100", {
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


		const dailyCosts: any[] = await res.json();
		const dailyCostsEclipse = dailyCosts.find(cost => cost.slug === "eclipse");
		if (dailyCostsEclipse === null) {
			throw Error("cannot find the results for eclipse");
		}

		return dailyCostsEclipse;

	} catch (err) {
		console.error(err);
	}


}

async function getCelestiaPrice() {
	try {
		const res = await fetch("https://api-mainnet.celenium.io/v1/stats/price/current", {
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

		const prices = await res.json();
		return prices.high;
	} catch (err) {
		console.error(err)
	}

}

async function main() {
	const eclipseCosts = await getDailyCostsEclipse();
	const celestiaPrice = await getCelestiaPrice();

	const timeSpan = 30;
	const totalSize = eclipseCosts.total_size;
	const messageCount = eclipseCosts.pfb_count;
	const averageMessageSize = totalSize / messageCount;
	const pricePerPFB = parseFloat(eclipseCosts.fee_per_pfb);

	const $ = calculators().calculatorUSD;
	const storage = $.storage(totalSize * timeSpan as Bytes, Duration.fromDays(timeSpan));
	const execute = $.execution(Mode.Replicated, 1_000_000 as Instructions);
	const send = $.message(
		Mode.Replicated,
		Direction.UserToCanister,
		averageMessageSize as Bytes,
	);

	return ({
		date: (new Date()).toISOString(),
		totalStorageSize: `${totalSize / 1_000_000_000}GB`,
		timePeriodForStorage: timeSpan,
		ingressMessageCount: messageCount,
		results: {
			ic: {
				totalPrice: storage + ((execute + send) * messageCount * timeSpan)
			},
			celestia: celestiaPrice * pricePerPFB * messageCount / 1_000_000 * timeSpan,
		}
	})
}

main().then(res => console.log(res)).catch(err => console.error(err))
