import { TypeormDatabase } from "@subsquid/typeorm-store";
import {
  OutboundMessageAcceptedOnEthereum,
  TransferStatusToPolkadot,
  TransferStatusToPolkadotV2,
  InboundMessageDispatchedOnEthereum,
  TransferStatusToEthereum,
  TransferStatusToEthereumV2,
} from "../../model";
import * as gateway from "./abi/GatewayV2";
import { processor, GATEWAY_ADDRESS } from "./processor";
import { TransferStatusEnum, transformBigInt } from "../../common";
import { Context } from "./processor";
import { AbiCoder } from "ethers";
import * as registryInfo from "../registry.json";

processor.run(
  new TypeormDatabase({ supportHotBlocks: true, stateSchema: "eth_processor" }),
  async (ctx) => {
    await processInboundEvents(ctx);
    await processOutboundEvents(ctx);
    await processInboundV2Events(ctx);
    await processOutboundV2Events(ctx);
  }
);

async function processOutboundEvents(ctx: Context) {
  let outboundMessages: OutboundMessageAcceptedOnEthereum[] = [],
    transfersToPolkadot: TransferStatusToPolkadot[] = [];
  for (let c of ctx.blocks) {
    let tokenSent;
    let outboundMessageAccepted: OutboundMessageAcceptedOnEthereum;
    for (let log of c.logs) {
      if (
        log.address == GATEWAY_ADDRESS &&
        (log.topics[0] == gateway.events.TokenSent.topic ||
          log.topics[0] ==
            gateway.events[
              "OutboundMessageAccepted(bytes32 indexed,uint64,bytes32 indexed,bytes)"
            ].topic)
      ) {
        if (log.topics[0] == gateway.events.TokenSent.topic) {
          let { token, sender, destinationChain, destinationAddress, amount } =
            gateway.events.TokenSent.decode(log);
          tokenSent = {
            id: log.id,
            blockNumber: c.header.height,
            txHash: log.transactionHash,
            timestamp: new Date(c.header.timestamp),
            tokenAddress: token,
            senderAddress: sender,
            destinationParaId: destinationChain,
            destinationAddress: destinationAddress.data,
            amount: amount,
          };
        } else if (
          log.topics[0] ==
          gateway.events[
            "OutboundMessageAccepted(bytes32 indexed,uint64,bytes32 indexed,bytes)"
          ].topic
        ) {
          let { channelID, messageID, nonce } =
            gateway.events[
              "OutboundMessageAccepted(bytes32 indexed,uint64,bytes32 indexed,bytes)"
            ].decode(log);
          outboundMessageAccepted = new OutboundMessageAcceptedOnEthereum({
            id: log.id,
            blockNumber: c.header.height,
            txHash: log.transactionHash,
            timestamp: new Date(c.header.timestamp),
            channelId: channelID,
            messageId: messageID.toString().toLowerCase(),
            nonce: Number(nonce),
          });
        }
      }
    }
    // Merge OutboundMessageAccepted event with TokenSent event to generate the TransferStatusToPolkadot
    if (
      outboundMessageAccepted! &&
      tokenSent! &&
      tokenSent.txHash == outboundMessageAccepted.txHash
    ) {
      outboundMessages.push(outboundMessageAccepted);
      let transferToPolkadot = await ctx.store.findOneBy(
        TransferStatusToPolkadot,
        {
          id: outboundMessageAccepted.messageId,
        }
      );
      if (!transferToPolkadot) {
        transfersToPolkadot.push(
          new TransferStatusToPolkadot({
            id: outboundMessageAccepted.messageId,
            messageId: outboundMessageAccepted.messageId,
            txHash: outboundMessageAccepted.txHash,
            blockNumber: c.header.height,
            timestamp: new Date(c.header.timestamp),
            channelId: outboundMessageAccepted.channelId,
            nonce: outboundMessageAccepted.nonce,
            tokenAddress: tokenSent.tokenAddress,
            senderAddress: tokenSent.senderAddress,
            destinationParaId: tokenSent.destinationParaId,
            destinationAddress: tokenSent.destinationAddress,
            amount: tokenSent.amount,
            status: TransferStatusEnum.Pending,
          })
        );
      }
    }
  }
  if (outboundMessages.length > 0) {
    await ctx.store.save(outboundMessages);
  }
  if (transfersToPolkadot.length > 0) {
    await ctx.store.save(transfersToPolkadot);
  }
}

async function processInboundEvents(ctx: Context) {
  let inboundMessages: InboundMessageDispatchedOnEthereum[] = [],
    transfersToEthereum: TransferStatusToEthereum[] = [];
  for (let c of ctx.blocks) {
    let inboundMessage: InboundMessageDispatchedOnEthereum;
    let transferToEthreum: TransferStatusToEthereum | undefined;
    for (let log of c.logs) {
      if (
        log.address == GATEWAY_ADDRESS &&
        log.topics[0] ==
          gateway.events[
            "InboundMessageDispatched(bytes32 indexed,uint64,bytes32 indexed,bool)"
          ].topic
      ) {
        if (
          log.topics[0] ==
          gateway.events[
            "InboundMessageDispatched(bytes32 indexed,uint64,bytes32 indexed,bool)"
          ].topic
        ) {
          let { channelID, messageID, nonce, success } =
            gateway.events[
              "InboundMessageDispatched(bytes32 indexed,uint64,bytes32 indexed,bool)"
            ].decode(log);
          inboundMessage = new InboundMessageDispatchedOnEthereum({
            id: log.id,
            blockNumber: c.header.height,
            txHash: log.transactionHash,
            timestamp: new Date(c.header.timestamp),
            channelId: channelID,
            messageId: messageID.toString().toLowerCase(),
            nonce: Number(nonce),
            success: success,
          });
          inboundMessages.push(inboundMessage);
        }
      }
    }
    if (inboundMessage!) {
      transferToEthreum = await ctx.store.findOneBy(TransferStatusToEthereum, {
        id: inboundMessage.messageId,
      });
      if (transferToEthreum!) {
        transferToEthreum.channelId = inboundMessage.channelId;
        transferToEthreum.toDestination = inboundMessage;
        if (inboundMessage.success) {
          transferToEthreum.status = TransferStatusEnum.Complete;
        } else {
          transferToEthreum.status = TransferStatusEnum.Failed;
        }
        transfersToEthereum.push(transferToEthreum);
      }
    }
  }
  if (inboundMessages.length > 0) {
    await ctx.store.save(inboundMessages);
  }
  if (transfersToEthereum.length > 0) {
    await ctx.store.save(transfersToEthereum);
  }
}

async function processInboundV2Events(ctx: Context) {
  let inboundMessages: InboundMessageDispatchedOnEthereum[] = [],
    transfersToEthereum: TransferStatusToEthereumV2[] = [];
  for (let c of ctx.blocks) {
    let inboundMessage: InboundMessageDispatchedOnEthereum;
    let transferToEthreum: TransferStatusToEthereumV2 | undefined;
    for (let log of c.logs) {
      if (
        log.address == GATEWAY_ADDRESS &&
        log.topics[0] ==
          gateway.events[
            "InboundMessageDispatched(uint64 indexed,bytes32,bool,bytes32)"
          ].topic
      ) {
        let { nonce, topic, success, rewardAddress } =
          gateway.events[
            "InboundMessageDispatched(uint64 indexed,bytes32,bool,bytes32)"
          ].decode(log);
        inboundMessage = new InboundMessageDispatchedOnEthereum({
          id: log.id,
          blockNumber: c.header.height,
          txHash: log.transactionHash,
          timestamp: new Date(c.header.timestamp),
          messageId: topic.toString().toLowerCase(),
          nonce: Number(nonce),
          success: success,
          rewardAddress,
        });
        inboundMessages.push(inboundMessage);
        if (inboundMessage!) {
          transferToEthreum = await ctx.store.findOneBy(
            TransferStatusToEthereumV2,
            {
              id: inboundMessage.messageId,
            }
          );
          if (transferToEthreum!) {
            transferToEthreum.toDestination = inboundMessage;
            if (inboundMessage.success) {
              transferToEthreum.status = TransferStatusEnum.Complete;
            } else {
              transferToEthreum.status = TransferStatusEnum.Failed;
            }
            transfersToEthereum.push(transferToEthreum);
          }
        }
      }
    }
  }
  if (inboundMessages.length > 0) {
    await ctx.store.save(inboundMessages);
  }
  if (transfersToEthereum.length > 0) {
    await ctx.store.save(transfersToEthereum);
  }
}

async function processOutboundV2Events(ctx: Context) {
  const abiCoder = new AbiCoder();
  const registry = transformBigInt(registryInfo);
  const assets = registry.ethereumChains[registry.ethChainId].assets;
  const localAssetType = ["address", "uint128"];
  const foreignAssetType = ["bytes32", "uint128"];

  let outboundMessages: OutboundMessageAcceptedOnEthereum[] = [],
    transfersToPolkadot: TransferStatusToPolkadotV2[] = [];
  for (let c of ctx.blocks) {
    let outboundMessageAccepted: OutboundMessageAcceptedOnEthereum;
    for (let log of c.logs) {
      if (
        log.address == GATEWAY_ADDRESS &&
        log.topics[0] ==
          gateway.events[
            "OutboundMessageAccepted(uint64,(address,(uint8,bytes)[],(uint8,bytes),bytes,uint128,uint128,uint128))"
          ].topic
      ) {
        let { nonce, payload } =
          gateway.events[
            "OutboundMessageAccepted(uint64,(address,(uint8,bytes)[],(uint8,bytes),bytes,uint128,uint128,uint128))"
          ].decode(log);
        outboundMessageAccepted = new OutboundMessageAcceptedOnEthereum({
          id: log.id,
          blockNumber: c.header.height,
          txHash: log.transactionHash,
          timestamp: new Date(c.header.timestamp),
          // In V2, messageID isn't available on the source chain.
          // As a workaround, we set nonce as a temporary value
          // and later update it to messageID on BH.
          messageId: nonce.toString().toLowerCase(),
          nonce: Number(nonce),
        });
        outboundMessages.push(outboundMessageAccepted);
        // Todo: Initially, we may allow only one asset to follow V1. Supporting multiple assets
        // later would require schema changes
        let asset = payload.assets[0];
        let tokenRawData = asset.data;
        let decodedToken,
          tokenAddress: string,
          tokenID: string,
          tokenAmount: bigint;
        if (asset.kind == 0) {
          decodedToken = abiCoder.decode(localAssetType, tokenRawData);
          tokenAddress = decodedToken[0];
          tokenAmount = decodedToken[1];
          tokenID = "";
        } else {
          decodedToken = abiCoder.decode(foreignAssetType, tokenRawData);
          tokenID = decodedToken[0];
          tokenAddress = Object.keys(assets)
            .map((t) => assets[t])
            .find((asset) =>
              asset.foreignId?.toLowerCase().startsWith(tokenID.toLowerCase())
            )?.token;
          tokenAmount = decodedToken[1];
        }
        transfersToPolkadot.push(
          new TransferStatusToPolkadotV2({
            // V2 transfer using nonce as the PK
            id: outboundMessageAccepted.nonce.toString(),
            messageId: outboundMessageAccepted.messageId,
            txHash: outboundMessageAccepted.txHash,
            blockNumber: c.header.height,
            timestamp: new Date(c.header.timestamp),
            nonce: outboundMessageAccepted.nonce,
            senderAddress: payload.origin,
            tokenAddress,
            tokenID,
            amount: tokenAmount,
            status: TransferStatusEnum.Pending,
          })
        );
      }
    }
  }
  if (outboundMessages.length > 0) {
    await ctx.store.save(outboundMessages);
  }
  if (transfersToPolkadot.length > 0) {
    await ctx.store.save(transfersToPolkadot);
  }
}
