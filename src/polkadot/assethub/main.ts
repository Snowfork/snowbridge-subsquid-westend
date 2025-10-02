import { TypeormDatabase, Store } from "@subsquid/typeorm-store";
import { processor, ProcessorContext } from "./processor";
import {
  MessageProcessedOnPolkadot,
  TransferStatusToPolkadot,
  TransferStatusToEthereum,
} from "../../model";
import { events } from "./types";
import { Bytes } from "./types/support";
import {
  AggregateMessageOrigin,
  V4Instruction,
  V4Location,
  ProcessMessageError,
} from "./types/v1002000";
import { ProcessMessageError as ProcessMessageErrorV1003000 } from "./types/v1003000";
import { V5Location, V5Instruction } from "./types/v1005001";
import {
  TransferStatusEnum,
  BridgeHubParaId,
  AssetHubParaId,
  KusamaAssetHubParaId,
  toSubscanEventID,
  findTokenAddress,
  KusamaNetwork,
  PolkadotNetwork,
  findTokenLocationOnSourceChain,
} from "../../common";

processor.run(
  new TypeormDatabase({
    supportHotBlocks: true,
    stateSchema: "assethub_processor",
  }),
  async (ctx) => {
    await processInboundEvents(ctx);
    await processOutboundEvents(ctx);
  }
);

async function processOutboundEvents(ctx: ProcessorContext<Store>) {
  let transfersToEthereum: TransferStatusToEthereum[] = [],
    forwardMessages: MessageProcessedOnPolkadot[] = [],
    transfersToKusama: TransferStatusToPolkadot[] = [];
  for (let block of ctx.blocks) {
    let xcmpMessageSent = false;
    let transfers: TransferStatusToEthereum[] = [];
    let transfersKusama: TransferStatusToPolkadot[] = [];
    let messagesInBlock: MessageProcessedOnPolkadot[] = [];
    for (let event of block.events) {
      if (event.name == events.xcmpQueue.xcmpMessageSent.name) {
        xcmpMessageSent = true;
      } else if (
        event.name == events.messageQueue.processed.name ||
        event.name == events.messageQueue.processingFailed.name
      ) {
        let rec: {
          id: Bytes;
          origin: AggregateMessageOrigin;
          success?: boolean;
          error?: ProcessMessageError | ProcessMessageErrorV1003000;
        };
        if (events.messageQueue.processed.v1002000.is(event)) {
          rec = events.messageQueue.processed.v1002000.decode(event);
        } else if (events.messageQueue.processingFailed.v1002000.is(event)) {
          rec = events.messageQueue.processingFailed.v1002000.decode(event);
        } else if (events.messageQueue.processingFailed.v1003000.is(event)) {
          rec = events.messageQueue.processingFailed.v1003000.decode(event);
        } else {
          throw Object.assign(new Error("Unsupported spec"), event);
        }
        // Filter message from non system parachain
        if (rec.origin.__kind == "Sibling" && rec.origin.value >= 2000) {
          let messageForwarded = new MessageProcessedOnPolkadot({
            id: toSubscanEventID(event.id),
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp!),
            messageId: rec.id.toString().toLowerCase(),
            paraId: AssetHubParaId,
            success: rec.success,
            eventId: toSubscanEventID(event.id),
            network: PolkadotNetwork,
          });
          messagesInBlock.push(messageForwarded);
          forwardMessages.push(messageForwarded);
        }
      } else if (event.name == events.polkadotXcm.sent.name) {
        let rec: {
          origin: V4Location | V5Location;
          destination: V4Location | V5Location;
          messageId: Bytes;
          message: V4Instruction[] | V5Instruction[];
        };
        if (events.polkadotXcm.sent.v1002000.is(event)) {
          rec = events.polkadotXcm.sent.v1002000.decode(event);
        } else if (events.polkadotXcm.sent.v1005001.is(event)) {
          rec = events.polkadotXcm.sent.v1005001.decode(event);
        } else {
          throw Object.assign(new Error("Unsupported spec"), event);
        }
        if (
          rec.destination.parents == 2 &&
          rec.destination.interior.__kind == "X1" &&
          rec.destination.interior.value[0].__kind == "GlobalConsensus" &&
          rec.destination.interior.value[0].value.__kind == "Ethereum" &&
          rec.message.length
        ) {
          let amount: bigint = BigInt(0);
          let senderAddress: Bytes = "";
          let tokenAddress: Bytes = "";
          let tokenLocation: Bytes = "";
          let destinationAddress: Bytes = "";

          let messageId = rec.messageId.toString().toLowerCase();
          if (rec.origin.interior.__kind == "X1") {
            let val = rec.origin.interior.value[0];
            if (val.__kind == "AccountId32") {
              senderAddress = val.id;
            }
          }

          let instruction0 = rec.message[0];
          // WithdrawAsset for ENA and ReserveAssetDeposited for PNA
          if (
            instruction0.__kind == "WithdrawAsset" ||
            instruction0.__kind == "ReserveAssetDeposited"
          ) {
            let asset = instruction0.value[0];
            tokenLocation = JSON.stringify(asset.id, (key, value) =>
              typeof value === "bigint" ? value.toString() : value
            );
            if (asset.fun.__kind == "Fungible") {
              amount = asset.fun.value;
              // For ENA extract the token address
              if (
                instruction0.__kind == "WithdrawAsset" &&
                asset.id.interior.__kind == "X1"
              ) {
                let val = asset.id.interior.value[0];
                if (val.__kind == "AccountKey20") {
                  tokenAddress = val.key;
                }
              }
              // For native Ether
              else if (
                instruction0.__kind == "WithdrawAsset" &&
                asset.id.interior.__kind == "Here"
              ) {
                tokenAddress = "0x0000000000000000000000000000000000000000";
              }
              // For PNA retrieving from the static map, can be improved by using another indexer
              else {
                tokenAddress = findTokenAddress("polkadot", tokenLocation);
              }
            }
          }

          let instruction3 = rec.message[3];
          if (instruction3.__kind == "DepositAsset") {
            let beneficiary = instruction3.beneficiary;
            if (beneficiary.interior.__kind == "X1") {
              let val = beneficiary.interior.value[0];
              if (val.__kind == "AccountKey20") {
                destinationAddress = val.key;
              }
            }
          }

          let transferToEthereum = new TransferStatusToEthereum({
            id: messageId,
            txHash: event.extrinsic?.hash,
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp!),
            messageId: messageId,
            tokenAddress,
            tokenLocation,
            sourceParaId: AssetHubParaId,
            senderAddress,
            destinationAddress,
            amount,
            status: TransferStatusEnum.Pending,
          });
          transfers.push(transferToEthereum);
        } else if (
          rec.destination.parents == 2 &&
          rec.destination.interior.__kind == "X2" &&
          rec.destination.interior.value[0].__kind == "GlobalConsensus" &&
          rec.destination.interior.value[0].value.__kind == "Kusama" &&
          rec.destination.interior.value[1].__kind == "Parachain" &&
          rec.destination.interior.value[1].value == KusamaAssetHubParaId &&
          rec.message[0] &&
          rec.message[0].__kind == "ReserveAssetDeposited"
        ) {
          // Destination Kusama AH
          let amount: bigint = BigInt(0);
          let senderAddress: Bytes = "";
          let tokenAddress: Bytes = "";
          let tokenLocation: Bytes = "";
          let destinationAddress: Bytes = "";

          let messageId = rec.messageId.toString().toLowerCase();
          if (rec.origin.interior.__kind == "X1") {
            let val = rec.origin.interior.value[0];
            if (val.__kind == "AccountId32") {
              senderAddress = val.id;
            }
          }

          let instruction0 = rec.message[0];
          let instruction2 = rec.message[2];
          if (instruction2.__kind == "WithdrawAsset") {
            let asset = instruction2.value[0];
            if (asset.fun.__kind === "Fungible") {
              amount = asset.fun.value;
              const { parents, interior } = asset.id;

              if (parents === 1 && interior.__kind == "Here") {
                // KSM
                tokenLocation = JSON.stringify(asset.id, (key, value) =>
                  typeof value === "bigint" ? value.toString() : value
                );
                tokenAddress = findTokenAddress(KusamaNetwork, tokenLocation);
                tokenLocation = findTokenLocationOnSourceChain(
                  PolkadotNetwork,
                  tokenAddress
                );
              }
            }

            if (rec.message[4].__kind == "DepositAsset") {
              let beneficiary = rec.message[4].beneficiary;
              if (beneficiary.interior.__kind == "X1") {
                let val = beneficiary.interior.value[0];
                if (val.__kind == "AccountId32") {
                  destinationAddress = val.id;
                }
              }
            }
          } else if (instruction0.__kind == "ReserveAssetDeposited") {
            // If there is only one asset, the asset transferred is DOT.
            let asset = instruction0.value[0];
            if (instruction0.value.length > 1) {
              //If there is more than one asset, the asset being transferred is not DOT.
              asset = instruction0.value[1];
            }

            tokenLocation = JSON.stringify(asset.id, (key, value) =>
              typeof value === "bigint" ? value.toString() : value
            );

            if (asset.fun.__kind === "Fungible") {
              amount = asset.fun.value;
              const { parents, interior } = asset.id;
              if (
                parents === 2 &&
                interior.__kind === "X1" &&
                interior.value[0].__kind === "GlobalConsensus" &&
                interior.value[0].value.__kind === "Ethereum"
              ) {
                // Ethereum native ETH
                tokenAddress = "0x0000000000000000000000000000000000000000";
              } else if (
                parents === 2 &&
                interior.__kind === "X2" &&
                interior.value[0].__kind === "GlobalConsensus" &&
                interior.value[0].value.__kind === "Ethereum"
              ) {
                // Ethereum ERC-20
                const val = interior.value[1];
                if (val.__kind === "AccountKey20") {
                  tokenAddress = val.key;
                } else {
                  throw new Error("Unsupported Ethereum asset format.");
                }
              } else {
                tokenAddress = findTokenAddress(KusamaNetwork, tokenLocation);
                // Get token relative to source. tokenLocation above is relative to the destination.
                tokenLocation = findTokenLocationOnSourceChain(
                  PolkadotNetwork,
                  tokenAddress
                );
              }
            }

            let instruction3 = rec.message[3];
            if (instruction3.__kind == "DepositAsset") {
              let beneficiary = instruction3.beneficiary;
              if (beneficiary.interior.__kind == "X1") {
                let val = beneficiary.interior.value[0];
                if (val.__kind == "AccountId32") {
                  destinationAddress = val.id;
                }
              }
            }
          }

          let transferToKusama = new TransferStatusToPolkadot({
            id: messageId,
            txHash: event.extrinsic?.hash,
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp!),
            messageId: messageId,
            tokenAddress,
            tokenLocation,
            sourceNetwork: PolkadotNetwork,
            sourceParaId: AssetHubParaId,
            destinationNetwork: KusamaNetwork,
            destinationParaId: KusamaAssetHubParaId,
            senderAddress,
            destinationAddress,
            amount,
            status: TransferStatusEnum.Pending,
          });

          transfersKusama.push(transferToKusama);
        }
      }
    }
    // Start from AH
    if (transfers.length) {
      for (let transfer of transfers) {
        let transferStatus = await ctx.store.findOneBy(
          TransferStatusToEthereum,
          {
            id: transfer.messageId,
          }
        );
        if (!transferStatus) {
          transfersToEthereum.push(transfer);
        }
      }
    }
    // Start from 3rd Parachain
    if (xcmpMessageSent) {
      for (let messageForwarded of messagesInBlock) {
        let transfer = await ctx.store.findOneBy(TransferStatusToEthereum, {
          id: messageForwarded.messageId,
        });
        if (transfer!) {
          transfer.toAssetHubMessageQueue = messageForwarded;
          if (!messageForwarded.success) {
            transfer.status = TransferStatusEnum.Failed;
          }
          transfersToEthereum.push(transfer);
        }
      }
    }

    // Kusama
    if (transfersKusama.length) {
      for (let transferKusama of transfersKusama) {
        let existingRecord = await ctx.store.findOneBy(
          TransferStatusToPolkadot,
          {
            id: transferKusama.messageId,
          }
        );
        let processedMessage = await ctx.store.findOneBy(
          MessageProcessedOnPolkadot,
          {
            id: transferKusama.messageId,
            network: KusamaNetwork,
          }
        );
        if (processedMessage) {
          if (!processedMessage.success) {
            transferKusama.status = TransferStatusEnum.Failed;
          } else {
            transferKusama.status = TransferStatusEnum.Complete;
          }
        }
        transferKusama.toAssetHubMessageQueue = processedMessage;
        transferKusama.toDestination = processedMessage;
        if (!existingRecord) {
          transfersToKusama.push(transferKusama);
        }
      }
    }
  }

  if (forwardMessages.length > 0) {
    ctx.log.debug("saving forward messages to ethereum");
    await ctx.store.save(forwardMessages);
  }

  if (transfersToEthereum.length > 0) {
    ctx.log.debug("saving transfer messages to ethereum");
    await ctx.store.save(transfersToEthereum);
  }

  if (transfersToKusama.length > 0) {
    ctx.log.debug("saving transfer messages from polkadot to kusama");
    await ctx.store.save(transfersToKusama);
  }
}

async function processInboundEvents(ctx: ProcessorContext<Store>) {
  let transfersToPolkadot: TransferStatusToPolkadot[] = [],
    processedMessages: MessageProcessedOnPolkadot[] = [];
  for (let block of ctx.blocks) {
    let processedMessagesInBlock: MessageProcessedOnPolkadot[] = [];
    for (let event of block.events) {
      if (
        event.name == events.messageQueue.processed.name ||
        event.name == events.messageQueue.processingFailed.name
      ) {
        let rec: {
          id: Bytes;
          origin: AggregateMessageOrigin;
          success?: boolean;
          error?: ProcessMessageError | ProcessMessageErrorV1003000;
        };

        // Add debug for the specific event we're looking for
        if (block.header.height === 8885130) {
          console.log("FOUND BLOCK 8885130 EVENT:", event.name);
          console.log("EVENT DATA:", JSON.stringify(event, null, 2));
        }
        if (events.messageQueue.processed.v1002000.is(event)) {
          rec = events.messageQueue.processed.v1002000.decode(event);
        } else if (events.messageQueue.processingFailed.v1002000.is(event)) {
          rec = events.messageQueue.processingFailed.v1002000.decode(event);
        } else if (events.messageQueue.processingFailed.v1003000.is(event)) {
          rec = events.messageQueue.processingFailed.v1003000.decode(event);
        } else {
          throw Object.assign(new Error("Unsupported spec"), event);
        }
        // Filter message from BH
        if (
          rec.origin.__kind == "Sibling" &&
          rec.origin.value == BridgeHubParaId
        ) {
          let processedMessage = new MessageProcessedOnPolkadot({
            id: toSubscanEventID(event.id),
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp!),
            messageId: rec.id.toString().toLowerCase(),
            paraId: AssetHubParaId,
            success: rec.success,
            eventId: toSubscanEventID(event.id),
            network: PolkadotNetwork,
          });
          processedMessagesInBlock.push(processedMessage);
        }
      }
    }

    if (processedMessagesInBlock.length) {
      for (let processedMessage of processedMessagesInBlock) {
        processedMessages.push(processedMessage);
        let transfer = await ctx.store.findOneBy(TransferStatusToPolkadot, {
          id: processedMessage.messageId,
        });
        if (transfer!) {
          if (!processedMessage.success) {
            transfer.status = TransferStatusEnum.Failed;
          } else {
            transfer.status = TransferStatusEnum.Complete;
            if (transfer.destinationParaId == AssetHubParaId) {
              // Terminated on AH
              transfer.toAssetHubMessageQueue = processedMessage;
              transfer.toDestination = processedMessage;
            } else {
              // Forward to 3rd Parachain
              transfer.toAssetHubMessageQueue = processedMessage;
            }
          }
          transfersToPolkadot.push(transfer);
        }
      }
    }
  }

  if (processedMessages.length > 0) {
    ctx.log.debug("saving messageQueue processed messages");
    await ctx.store.save(processedMessages);
  }
  ctx.log.info(`transfer messages ${transfersToPolkadot.length}`);
  if (transfersToPolkadot.length > 0) {
    ctx.log.debug("saving transfer messages from Kusama to Polkadot");
    await ctx.store.save(transfersToPolkadot);
  }
}
