# ICDA Solution Comparison 
`results.json` shows the estimated monthly costs for running a rollup using either Celestia or Internet Computer.

The script found in `src/index.ts` pulls current statistics about the Eclipse rollup (Solana Virtual Machine on Ethereum) using the Celestia API aggregate and compares its costs to those if it ran on Internet Computer.

The costs for DA on IC are calculated as follows:

- **Storage**: Gets a daily estimate for storage on Celestia, multiplies by 30 (days)
- **Ingress**: Gets a daily message count and size on Celestia, multiplies by 30 (days)
- **Execution**: Assumes 1 million instruction executions
