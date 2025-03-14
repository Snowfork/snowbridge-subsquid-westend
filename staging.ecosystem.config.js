module.exports = {
  apps: [
    {
      name: "staging-ethereum",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/ethereum/main.ts",
    },
    {
      name: "staging-bridgehub",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/bridgehub/main.ts",
    },
    {
      name: "staging-assethub",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/assethub/main.ts",
    },
    {
      name: "staging-hydration",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/parachains/hydration/main.ts",
    },
    {
      name: "staging-moonbeam",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/parachains/moonbeam/main.ts",
    },
    {
      name: "staging-bifrost",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/parachains/bifrost/main.ts",
    },
    {
      name: "staging-acala",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/parachains/acala/main.ts",
    },
    {
      name: "staging-mythos",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/polkadot/parachains/mythos/main.ts",
    },
    {
      name: "staging-graphql",
      script: "./node_modules/.bin/squid-graphql-server",
    },
    {
      name: "staging-postprocess",
      interpreter: "node",
      node_args: "--require=ts-node/register --require=dotenv/config",
      script: "./src/postprocess/cron.ts",
    },
  ],
};
