module.exports = {
  apps: [
    {
      name: "westend-ethereum",
      node_args: "--require=dotenv/config",
      script: "./lib/westend/ethereum/main.js",
    },
    {
      name: "westend-bridgehub",
      node_args: "--require=dotenv/config",
      script: "./lib/westend/bridgehub/main.js",
    },
    {
      name: "westend-assethub",
      node_args: "--require=dotenv/config",
      script: "./lib/westend/assethub/main.js",
    },
    {
      name: "westend-staging-graphql",
      script: "./node_modules/.bin/squid-graphql-server",
    },
    {
      name: "westend-staging-postprocess",
      node_args: "--require=dotenv/config",
      script: "./lib/postprocess/cron.js",
    },
  ],
};
