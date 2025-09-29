import { TypeormDatabase, Store } from "@subsquid/typeorm-store";
import { processor, ProcessorContext } from "./processor";
import {
  MessageProcessedOnPolkadot,
  TransferStatusToPolkadot,
} from "../../model";
import { events } from "./types";
import { Bytes } from "./types/support";
import {
  TransferStatusEnum,
  KusamaAssetHubParaId,
  AssetHubParaId,
  BridgeHubParaId,
  findTokenAddress,
  toSubscanEventID,
  KusamaNetwork,
  PolkadotNetwork,
  findTokenLocationOnSourceChain,
} from "../../common";

processor.run(
  new TypeormDatabase({
    supportHotBlocks: true,
    stateSchema: "kusama_assethub_processor",
  }),
  async (ctx) => {
    await processKusamaEvents(ctx);
  }
);

async function processKusamaEvents(ctx: ProcessorContext<Store>) {
  let transfers: TransferStatusToPolkadot[] = [];
  let processedMessages: MessageProcessedOnPolkadot[] = [];
  for (let block of ctx.blocks) {
    let transfersFrom: TransferStatusToPolkadot[] = [];
    for (let event of block.events) {
      let rec: any;
      if (event.name == events.polkadotXcm.sent.name) {
        if (events.polkadotXcm.sent.v1002000.is(event)) {
          rec = events.polkadotXcm.sent.v1002000.decode(event);
        } else if (events.polkadotXcm.sent.v1005001.is(event)) {
          rec = events.polkadotXcm.sent.v1005001.decode(event);
        } else {
          throw Object.assign(new Error("Unsupported spec"), event);
        }
        if (
          rec.destination.parents == 2 &&
          rec.destination.interior.__kind == "X2" &&
          rec.destination.interior.value[0].__kind == "GlobalConsensus" &&
          rec.destination.interior.value[0].value.__kind == "Polkadot" &&
          rec.destination.interior.value[1].__kind == "Parachain" &&
          rec.destination.interior.value[1].value == AssetHubParaId &&
          rec.message.length &&
          rec.message[0].__kind == "ReserveAssetDeposited"
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
          let instruction2 = rec.message[2];
          if (instruction2.__kind == "WithdrawAsset") {
            let asset = instruction2.value[0];
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
                tokenAddress = findTokenAddress(PolkadotNetwork, tokenLocation);
                // Get token relative to source. tokenLocation above is relative to the destination.
                tokenLocation = findTokenLocationOnSourceChain(
                  KusamaNetwork,
                  tokenAddress
                );
              }

              let instruction4 = rec.message[4];
              if (instruction4.__kind == "DepositAsset") {
                let beneficiary = instruction4.beneficiary;
                if (beneficiary.interior.__kind == "X1") {
                  let val = beneficiary.interior.value[0];
                  if (val.__kind == "AccountId32") {
                    destinationAddress = val.id;
                  }
                }
              }
            }
          } else if (instruction0.__kind == "ReserveAssetDeposited") {
            // KSM
            let asset = instruction0.value[0];
            tokenLocation = JSON.stringify(asset.id, (key, value) =>
              typeof value === "bigint" ? value.toString() : value
            );

            if (asset.fun.__kind === "Fungible") {
              amount = asset.fun.value;
            }
            tokenAddress = findTokenAddress(PolkadotNetwork, tokenLocation);
            // Get token relative to source. tokenLocation above is relative to the destination.
            tokenLocation = findTokenLocationOnSourceChain(
              KusamaNetwork,
              tokenAddress
            );

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

          let transfer = new TransferStatusToPolkadot({
            id: messageId,
            txHash: event.extrinsic?.hash,
            blockNumber: block.header.height,
            timestamp: new Date(block.header.timestamp!),
            messageId: messageId,
            tokenAddress,
            tokenLocation,
            sourceNetwork: KusamaNetwork,
            sourceParaId: KusamaAssetHubParaId,
            destinationNetwork: PolkadotNetwork,
            destinationParaId: AssetHubParaId,
            senderAddress,
            destinationAddress,
            amount,
            status: TransferStatusEnum.Pending,
          });

          transfersFrom.push(transfer);
        }
      } else if (
        event.name == events.messageQueue.processed.name ||
        event.name == events.messageQueue.processingFailed.name
      ) {
        if (events.messageQueue.processed.v1002000.is(event)) {
          rec = events.messageQueue.processed.v1002000.decode(event);
        } else if (events.messageQueue.processingFailed.v1002000.is(event)) {
          rec = events.messageQueue.processingFailed.v1002000.decode(event);
        } else if (events.messageQueue.processingFailed.v1003000.is(event)) {
          rec = events.messageQueue.processingFailed.v1003000.decode(event);
        } else {
          throw Object.assign(new Error("Unsupported spec"), event);
        }
        // Only check messages from BH
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
            network: KusamaNetwork,
          });
          processedMessages.push(processedMessage);
        }
      }
    }

    if (transfersFrom.length) {
      for (let transfer of transfersFrom) {
        let existingRecord = await ctx.store.findOneBy(
          TransferStatusToPolkadot,
          {
            id: transfer.messageId,
          }
        );
        // Set status if the processed message happened before the actual tx row
        let status = await ctx.store.findOneBy(MessageProcessedOnPolkadot, {
          id: transfer.messageId,
          network: PolkadotNetwork,
        });
        if (status) {
          if (!status.success) {
            transfer.status = TransferStatusEnum.Failed;
          } else {
            transfer.status = TransferStatusEnum.Complete;
          }
        }
        if (!existingRecord) {
          transfers.push(transfer);
        }
      }
    }
  }

  if (processedMessages.length) {
    for (let processedMessage of processedMessages) {
      let kusamaTransfer = await ctx.store.findOneBy(TransferStatusToPolkadot, {
        id: processedMessage.messageId,
      });

      if (kusamaTransfer!) {
        if (!processedMessage.success) {
          kusamaTransfer.status = TransferStatusEnum.Failed;
        } else {
          kusamaTransfer.status = TransferStatusEnum.Complete;
        }
        kusamaTransfer.toAssetHubMessageQueue = processedMessage;
        kusamaTransfer.toDestination = processedMessage;
        transfers.push(kusamaTransfer);
      }
    }
  }

  if (processedMessages.length > 0) {
    ctx.log.debug("saving messageQueue processed messages");
    await ctx.store.save(processedMessages);
  }

  if (transfers.length > 0) {
    ctx.log.debug("saving transfer messages from Kusama to Polkadot");
    await ctx.store.save(transfers);
  }
}
