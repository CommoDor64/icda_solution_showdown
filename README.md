# ICDA Solution Comparison 

`results.json` shows the estimated monthly consts for running a rollup using either Celestia or Internet Computer.

The script found in `src/index.ts` pulls current statistics about the `Eclipse` rollup (Solana Virtutal Machine on Ethereum) using the celenium API aggregate for Celestia
and comapres its costs to the ones if it ran on Internet Computer.

The costs for DA in IC are calculated as follows:
1. Storage - Ges a daily estimate for storage on Celestia, multiplies by 30 (days)
2. Ingress - Gets a daily message count and size on Celestia, multiplies by 30 (days)
3. Execution - Assumes 1 million instruction execution
