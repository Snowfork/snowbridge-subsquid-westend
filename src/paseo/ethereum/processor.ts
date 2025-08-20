import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import * as gateway from "./abi/Gateway";

export const GATEWAY_ADDRESS =
  process.env["GATEWAY_ADDRESS"] ||
  "0x1607C1368bc943130258318c91bBd8cFf3D063E6".toLowerCase();

const SUBSQUID_NETWORK =
  process.env["SUBSQUID_NETWORK_ETH"] || "ethereum-sepolia";

const START_BLOCK = process.env["START_BLOCK_ETH"]
  ? parseInt(process.env["START_BLOCK_ETH"])
  : 8569522;

const RPC_URL =
  process.env["RPC_ETH_HTTP"] || "https://rpc.ankr.com/eth_sepolia";

const POLL_INTERVAL = parseInt(process.env["POLL_INTERVAL"] || "30000");

export const processor = new EvmBatchProcessor()
  // Lookup archive by the network name in Subsquid registry
  // See https://docs.subsquid.io/evm-indexing/supported-networks/
  .setGateway(`https://v2.archive.subsquid.io/network/${SUBSQUID_NETWORK}`)
  // Chain RPC endpoint is required for
  //  - indexing unfinalized blocks https://docs.subsquid.io/basics/unfinalized-blocks/
  //  - querying the contract state https://docs.subsquid.io/evm-indexing/query-state/
  .setRpcEndpoint({
    // Set via .env for local runs or via secrets when deploying to Subsquid Cloud
    // https://docs.subsquid.io/deploy-squid/env-variables/
    url: RPC_URL,
    // More RPC connection options at https://docs.subsquid.io/evm-indexing/configuration/initialization/#set-data-source
    rateLimit: 10,
  })
  .setRpcDataIngestionSettings({ headPollInterval: POLL_INTERVAL })
  .setFinalityConfirmation(75)
  .setFields({
    log: {
      transactionHash: true,
    },
  })
  .setBlockRange({
    from: START_BLOCK,
  })
  .addLog({
    address: [GATEWAY_ADDRESS],
    topic0: [
      gateway.events.TokenSent.topic,
      gateway.events[
        "OutboundMessageAccepted(bytes32 indexed,uint64,bytes32 indexed,bytes)"
      ].topic,
      gateway.events[
        "InboundMessageDispatched(bytes32 indexed,uint64,bytes32 indexed,bool)"
      ].topic,
    ],
  });

export type Fields = EvmBatchProcessorFields<typeof processor>;
export type Context = DataHandlerContext<Store, Fields>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
