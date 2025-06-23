import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    AgentCreated: event("0x7c96960a1ebd8cc753b10836ea25bd7c9c4f8cd43590db1e8b3648cb0ec4cc89", "AgentCreated(bytes32,address)", {"agentID": p.bytes32, "agent": p.address}),
    AgentFundsWithdrawn: event("0xf953871855f78d5ccdd6268f2d9d69fc67f26542a35d2bba1c615521aed57054", "AgentFundsWithdrawn(bytes32,address,uint256)", {"agentID": indexed(p.bytes32), "recipient": indexed(p.address), "amount": p.uint256}),
    CommandFailed: event("0xa6dc208277bb3da3666e7305baf550db2daf26f8f386a431a4b27cc7a02965a2", "CommandFailed(uint64,uint256)", {"nonce": indexed(p.uint64), "index": p.uint256}),
    Deposited: event("0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4", "Deposited(address,uint256)", {"sender": p.address, "amount": p.uint256}),
    ForeignTokenRegistered: event("0x57f58171b8777633d03aff1e7408b96a3d910c93a7ce433a8cb7fb837dc306a6", "ForeignTokenRegistered(bytes32,address)", {"tokenID": indexed(p.bytes32), "token": p.address}),
    'InboundMessageDispatched(bytes32 indexed,uint64,bytes32 indexed,bool)': event("0x617fdb0cb78f01551a192a3673208ec5eb09f20a90acf673c63a0dcb11745a7a", "InboundMessageDispatched(bytes32,uint64,bytes32,bool)", {"channelID": indexed(p.bytes32), "nonce": p.uint64, "messageID": indexed(p.bytes32), "success": p.bool}),
    'InboundMessageDispatched(uint64 indexed,bytes32,bool,bytes32)': event("0x8856ab63954e6c2938803a4654fb704c8779757e7bfdbe94a578e341ec637a95", "InboundMessageDispatched(uint64,bytes32,bool,bytes32)", {"nonce": indexed(p.uint64), "topic": p.bytes32, "success": p.bool, "rewardAddress": p.bytes32}),
    OperatingModeChanged: event("0x4016a1377b8961c4aa6f3a2d3de830a685ddbfe0f228ffc0208eb96304c4cf1a", "OperatingModeChanged(uint8)", {"mode": p.uint8}),
    'OutboundMessageAccepted(bytes32 indexed,uint64,bytes32 indexed,bytes)': event("0x7153f9357c8ea496bba60bf82e67143e27b64462b49041f8e689e1b05728f84f", "OutboundMessageAccepted(bytes32,uint64,bytes32,bytes)", {"channelID": indexed(p.bytes32), "nonce": p.uint64, "messageID": indexed(p.bytes32), "payload": p.bytes}),
    'OutboundMessageAccepted(uint64,(address,(uint8,bytes)[],(uint8,bytes),bytes,uint128,uint128,uint128))': event("0x550e2067494b1736ea5573f2d19cdc0ac95b410fff161bf16f11c6229655ec9c", "OutboundMessageAccepted(uint64,(address,(uint8,bytes)[],(uint8,bytes),bytes,uint128,uint128,uint128))", {"nonce": p.uint64, "payload": p.struct({"origin": p.address, "assets": p.array(p.struct({"kind": p.uint8, "data": p.bytes})), "xcm": p.struct({"kind": p.uint8, "data": p.bytes}), "claimer": p.bytes, "value": p.uint128, "executionFee": p.uint128, "relayerFee": p.uint128})}),
    PricingParametersChanged: event("0x5e3c25378b5946068b94aa2ea10c4c1e215cc975f994322b159ddc9237a973d4", "PricingParametersChanged()", {}),
    TokenRegistrationSent: event("0xf78bb28d4b1d7da699e5c0bc2be29c2b04b5aab6aacf6298fe5304f9db9c6d7e", "TokenRegistrationSent(address)", {"token": p.address}),
    TokenSent: event("0x24c5d2de620c6e25186ae16f6919eba93b6e2c1a33857cc419d9f3a00d6967e9", "TokenSent(address,address,uint32,(uint8,bytes),uint128)", {"token": indexed(p.address), "sender": indexed(p.address), "destinationChain": indexed(p.uint32), "destinationAddress": p.struct({"kind": p.uint8, "data": p.bytes}), "amount": p.uint128}),
    TokenTransferFeesChanged: event("0x4793c0cb5bef4b1fdbbfbcf17e06991844eb881088b012442af17a12ff38d5cd", "TokenTransferFeesChanged()", {}),
    Upgraded: event("0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b", "Upgraded(address)", {"implementation": indexed(p.address)}),
}

export const functions = {
    AGENT_EXECUTOR: viewFun("0x423e69b6", "AGENT_EXECUTOR()", {}, p.address),
    BEEFY_CLIENT: viewFun("0x90ffc4f9", "BEEFY_CLIENT()", {}, p.address),
    agentOf: viewFun("0x5e6dae26", "agentOf(bytes32)", {"agentID": p.bytes32}, p.address),
    channelNoncesOf: viewFun("0x2a6c3229", "channelNoncesOf(bytes32)", {"channelID": p.bytes32}, {"_0": p.uint64, "_1": p.uint64}),
    channelOperatingModeOf: viewFun("0x0705f465", "channelOperatingModeOf(bytes32)", {"channelID": p.bytes32}, p.uint8),
    depositEther: fun("0x98ea5fca", "depositEther()", {}, ),
    implementation: viewFun("0x5c60da1b", "implementation()", {}, p.address),
    initialize: fun("0x439fab91", "initialize(bytes)", {"data": p.bytes}, ),
    isTokenRegistered: viewFun("0x26aa101f", "isTokenRegistered(address)", {"token": p.address}, p.bool),
    operatingMode: viewFun("0x38004f69", "operatingMode()", {}, p.uint8),
    pricingParameters: viewFun("0x0b617646", "pricingParameters()", {}, {"_0": p.uint256, "_1": p.uint128}),
    queryForeignTokenID: viewFun("0xbe8d42c0", "queryForeignTokenID(address)", {"token": p.address}, p.bytes32),
    quoteRegisterTokenFee: viewFun("0x805ce31d", "quoteRegisterTokenFee()", {}, p.uint256),
    quoteSendTokenFee: viewFun("0x928bc49d", "quoteSendTokenFee(address,uint32,uint128)", {"token": p.address, "destinationChain": p.uint32, "destinationFee": p.uint128}, p.uint256),
    registerToken: fun("0x09824a80", "registerToken(address)", {"token": p.address}, ),
    sendToken: fun("0x52054834", "sendToken(address,uint32,(uint8,bytes),uint128,uint128)", {"token": p.address, "destinationChain": p.uint32, "destinationAddress": p.struct({"kind": p.uint8, "data": p.bytes}), "destinationFee": p.uint128, "amount": p.uint128}, ),
    submitV1: fun("0xdf4ed829", "submitV1((bytes32,uint64,uint8,bytes,uint64,uint256,uint256,bytes32),bytes32[],((bytes32,uint256,bytes32,bytes32,(uint256,bytes4,bytes)[]),(uint256,uint256,bytes32[]),(uint8,uint32,bytes32,uint64,uint32,bytes32),bytes32[],uint256))", {"message": p.struct({"channelID": p.bytes32, "nonce": p.uint64, "command": p.uint8, "params": p.bytes, "maxDispatchGas": p.uint64, "maxFeePerGas": p.uint256, "reward": p.uint256, "id": p.bytes32}), "leafProof": p.array(p.bytes32), "headerProof": p.struct({"header": p.struct({"parentHash": p.bytes32, "number": p.uint256, "stateRoot": p.bytes32, "extrinsicsRoot": p.bytes32, "digestItems": p.array(p.struct({"kind": p.uint256, "consensusEngineID": p.bytes4, "data": p.bytes}))}), "headProof": p.struct({"pos": p.uint256, "width": p.uint256, "proof": p.array(p.bytes32)}), "leafPartial": p.struct({"version": p.uint8, "parentNumber": p.uint32, "parentHash": p.bytes32, "nextAuthoritySetID": p.uint64, "nextAuthoritySetLen": p.uint32, "nextAuthoritySetRoot": p.bytes32}), "leafProof": p.array(p.bytes32), "leafProofOrder": p.uint256})}, ),
    tokenAddressOf: viewFun("0xfe61cc49", "tokenAddressOf(bytes32)", {"tokenID": p.bytes32}, p.address),
    v1_handleAgentExecute: fun("0x8450a97c", "v1_handleAgentExecute(bytes)", {"data": p.bytes}, ),
    v1_handleMintForeignToken: fun("0x6a64d9fb", "v1_handleMintForeignToken(bytes32,bytes)", {"channelID": p.bytes32, "data": p.bytes}, ),
    v1_handleRegisterForeignToken: fun("0xc536218f", "v1_handleRegisterForeignToken(bytes)", {"data": p.bytes}, ),
    v1_handleSetOperatingMode: fun("0xc9bd1e5b", "v1_handleSetOperatingMode(bytes)", {"data": p.bytes}, ),
    v1_handleSetPricingParameters: fun("0xb0a23d44", "v1_handleSetPricingParameters(bytes)", {"data": p.bytes}, ),
    v1_handleSetTokenTransferFees: fun("0x27c1d325", "v1_handleSetTokenTransferFees(bytes)", {"data": p.bytes}, ),
    v1_handleUnlockNativeToken: fun("0x46cd2751", "v1_handleUnlockNativeToken(bytes)", {"data": p.bytes}, ),
    v1_handleUpgrade: fun("0x3f8bb4d9", "v1_handleUpgrade(bytes)", {"data": p.bytes}, ),
    v2_createAgent: fun("0xb39053c5", "v2_createAgent(bytes32)", {"id": p.bytes32}, ),
    v2_handleCallContract: fun("0x2fb8ac58", "v2_handleCallContract(bytes32,bytes)", {"origin": p.bytes32, "data": p.bytes}, ),
    v2_handleMintForeignToken: fun("0x988062ea", "v2_handleMintForeignToken(bytes)", {"data": p.bytes}, ),
    v2_handleRegisterForeignToken: fun("0x42e3ccfa", "v2_handleRegisterForeignToken(bytes)", {"data": p.bytes}, ),
    v2_handleSetOperatingMode: fun("0x2dd677b1", "v2_handleSetOperatingMode(bytes)", {"data": p.bytes}, ),
    v2_handleUnlockNativeToken: fun("0x3ae65d7e", "v2_handleUnlockNativeToken(bytes)", {"data": p.bytes}, ),
    v2_handleUpgrade: fun("0xf906d309", "v2_handleUpgrade(bytes)", {"data": p.bytes}, ),
    v2_isDispatched: viewFun("0xc66414c5", "v2_isDispatched(uint64)", {"nonce": p.uint64}, p.bool),
    v2_outboundNonce: viewFun("0x860929ee", "v2_outboundNonce()", {}, p.uint64),
    v2_registerToken: fun("0xd58a8be4", "v2_registerToken(address,uint8,uint128,uint128)", {"token": p.address, "network": p.uint8, "executionFee": p.uint128, "relayerFee": p.uint128}, ),
    v2_sendMessage: fun("0xf2e500b2", "v2_sendMessage(bytes,bytes[],bytes,uint128,uint128)", {"xcm": p.bytes, "assets": p.array(p.bytes), "claimer": p.bytes, "executionFee": p.uint128, "relayerFee": p.uint128}, ),
    v2_submit: fun("0xde469bc7", "v2_submit((bytes32,uint64,bytes32,(uint8,uint64,bytes)[]),bytes32[],((bytes32,uint256,bytes32,bytes32,(uint256,bytes4,bytes)[]),(uint256,uint256,bytes32[]),(uint8,uint32,bytes32,uint64,uint32,bytes32),bytes32[],uint256),bytes32)", {"message": p.struct({"origin": p.bytes32, "nonce": p.uint64, "topic": p.bytes32, "commands": p.array(p.struct({"kind": p.uint8, "gas": p.uint64, "payload": p.bytes}))}), "leafProof": p.array(p.bytes32), "headerProof": p.struct({"header": p.struct({"parentHash": p.bytes32, "number": p.uint256, "stateRoot": p.bytes32, "extrinsicsRoot": p.bytes32, "digestItems": p.array(p.struct({"kind": p.uint256, "consensusEngineID": p.bytes4, "data": p.bytes}))}), "headProof": p.struct({"pos": p.uint256, "width": p.uint256, "proof": p.array(p.bytes32)}), "leafPartial": p.struct({"version": p.uint8, "parentNumber": p.uint32, "parentHash": p.bytes32, "nextAuthoritySetID": p.uint64, "nextAuthoritySetLen": p.uint32, "nextAuthoritySetRoot": p.bytes32}), "leafProof": p.array(p.bytes32), "leafProofOrder": p.uint256}), "rewardAddress": p.bytes32}, ),
}

export class Contract extends ContractBase {

    AGENT_EXECUTOR() {
        return this.eth_call(functions.AGENT_EXECUTOR, {})
    }

    BEEFY_CLIENT() {
        return this.eth_call(functions.BEEFY_CLIENT, {})
    }

    agentOf(agentID: AgentOfParams["agentID"]) {
        return this.eth_call(functions.agentOf, {agentID})
    }

    channelNoncesOf(channelID: ChannelNoncesOfParams["channelID"]) {
        return this.eth_call(functions.channelNoncesOf, {channelID})
    }

    channelOperatingModeOf(channelID: ChannelOperatingModeOfParams["channelID"]) {
        return this.eth_call(functions.channelOperatingModeOf, {channelID})
    }

    implementation() {
        return this.eth_call(functions.implementation, {})
    }

    isTokenRegistered(token: IsTokenRegisteredParams["token"]) {
        return this.eth_call(functions.isTokenRegistered, {token})
    }

    operatingMode() {
        return this.eth_call(functions.operatingMode, {})
    }

    pricingParameters() {
        return this.eth_call(functions.pricingParameters, {})
    }

    queryForeignTokenID(token: QueryForeignTokenIDParams["token"]) {
        return this.eth_call(functions.queryForeignTokenID, {token})
    }

    quoteRegisterTokenFee() {
        return this.eth_call(functions.quoteRegisterTokenFee, {})
    }

    quoteSendTokenFee(token: QuoteSendTokenFeeParams["token"], destinationChain: QuoteSendTokenFeeParams["destinationChain"], destinationFee: QuoteSendTokenFeeParams["destinationFee"]) {
        return this.eth_call(functions.quoteSendTokenFee, {token, destinationChain, destinationFee})
    }

    tokenAddressOf(tokenID: TokenAddressOfParams["tokenID"]) {
        return this.eth_call(functions.tokenAddressOf, {tokenID})
    }

    v2_isDispatched(nonce: V2_isDispatchedParams["nonce"]) {
        return this.eth_call(functions.v2_isDispatched, {nonce})
    }

    v2_outboundNonce() {
        return this.eth_call(functions.v2_outboundNonce, {})
    }
}

/// Event types
export type AgentCreatedEventArgs = EParams<typeof events.AgentCreated>
export type AgentFundsWithdrawnEventArgs = EParams<typeof events.AgentFundsWithdrawn>
export type CommandFailedEventArgs = EParams<typeof events.CommandFailed>
export type DepositedEventArgs = EParams<typeof events.Deposited>
export type ForeignTokenRegisteredEventArgs = EParams<typeof events.ForeignTokenRegistered>
export type InboundMessageDispatchedEventArgs_0 = EParams<typeof events['InboundMessageDispatched(bytes32 indexed,uint64,bytes32 indexed,bool)']>
export type InboundMessageDispatchedEventArgs_1 = EParams<typeof events['InboundMessageDispatched(uint64 indexed,bytes32,bool,bytes32)']>
export type OperatingModeChangedEventArgs = EParams<typeof events.OperatingModeChanged>
export type OutboundMessageAcceptedEventArgs_0 = EParams<typeof events['OutboundMessageAccepted(bytes32 indexed,uint64,bytes32 indexed,bytes)']>
export type OutboundMessageAcceptedEventArgs_1 = EParams<typeof events['OutboundMessageAccepted(uint64,(address,(uint8,bytes)[],(uint8,bytes),bytes,uint128,uint128,uint128))']>
export type PricingParametersChangedEventArgs = EParams<typeof events.PricingParametersChanged>
export type TokenRegistrationSentEventArgs = EParams<typeof events.TokenRegistrationSent>
export type TokenSentEventArgs = EParams<typeof events.TokenSent>
export type TokenTransferFeesChangedEventArgs = EParams<typeof events.TokenTransferFeesChanged>
export type UpgradedEventArgs = EParams<typeof events.Upgraded>

/// Function types
export type AGENT_EXECUTORParams = FunctionArguments<typeof functions.AGENT_EXECUTOR>
export type AGENT_EXECUTORReturn = FunctionReturn<typeof functions.AGENT_EXECUTOR>

export type BEEFY_CLIENTParams = FunctionArguments<typeof functions.BEEFY_CLIENT>
export type BEEFY_CLIENTReturn = FunctionReturn<typeof functions.BEEFY_CLIENT>

export type AgentOfParams = FunctionArguments<typeof functions.agentOf>
export type AgentOfReturn = FunctionReturn<typeof functions.agentOf>

export type ChannelNoncesOfParams = FunctionArguments<typeof functions.channelNoncesOf>
export type ChannelNoncesOfReturn = FunctionReturn<typeof functions.channelNoncesOf>

export type ChannelOperatingModeOfParams = FunctionArguments<typeof functions.channelOperatingModeOf>
export type ChannelOperatingModeOfReturn = FunctionReturn<typeof functions.channelOperatingModeOf>

export type DepositEtherParams = FunctionArguments<typeof functions.depositEther>
export type DepositEtherReturn = FunctionReturn<typeof functions.depositEther>

export type ImplementationParams = FunctionArguments<typeof functions.implementation>
export type ImplementationReturn = FunctionReturn<typeof functions.implementation>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type IsTokenRegisteredParams = FunctionArguments<typeof functions.isTokenRegistered>
export type IsTokenRegisteredReturn = FunctionReturn<typeof functions.isTokenRegistered>

export type OperatingModeParams = FunctionArguments<typeof functions.operatingMode>
export type OperatingModeReturn = FunctionReturn<typeof functions.operatingMode>

export type PricingParametersParams = FunctionArguments<typeof functions.pricingParameters>
export type PricingParametersReturn = FunctionReturn<typeof functions.pricingParameters>

export type QueryForeignTokenIDParams = FunctionArguments<typeof functions.queryForeignTokenID>
export type QueryForeignTokenIDReturn = FunctionReturn<typeof functions.queryForeignTokenID>

export type QuoteRegisterTokenFeeParams = FunctionArguments<typeof functions.quoteRegisterTokenFee>
export type QuoteRegisterTokenFeeReturn = FunctionReturn<typeof functions.quoteRegisterTokenFee>

export type QuoteSendTokenFeeParams = FunctionArguments<typeof functions.quoteSendTokenFee>
export type QuoteSendTokenFeeReturn = FunctionReturn<typeof functions.quoteSendTokenFee>

export type RegisterTokenParams = FunctionArguments<typeof functions.registerToken>
export type RegisterTokenReturn = FunctionReturn<typeof functions.registerToken>

export type SendTokenParams = FunctionArguments<typeof functions.sendToken>
export type SendTokenReturn = FunctionReturn<typeof functions.sendToken>

export type SubmitV1Params = FunctionArguments<typeof functions.submitV1>
export type SubmitV1Return = FunctionReturn<typeof functions.submitV1>

export type TokenAddressOfParams = FunctionArguments<typeof functions.tokenAddressOf>
export type TokenAddressOfReturn = FunctionReturn<typeof functions.tokenAddressOf>

export type V1_handleAgentExecuteParams = FunctionArguments<typeof functions.v1_handleAgentExecute>
export type V1_handleAgentExecuteReturn = FunctionReturn<typeof functions.v1_handleAgentExecute>

export type V1_handleMintForeignTokenParams = FunctionArguments<typeof functions.v1_handleMintForeignToken>
export type V1_handleMintForeignTokenReturn = FunctionReturn<typeof functions.v1_handleMintForeignToken>

export type V1_handleRegisterForeignTokenParams = FunctionArguments<typeof functions.v1_handleRegisterForeignToken>
export type V1_handleRegisterForeignTokenReturn = FunctionReturn<typeof functions.v1_handleRegisterForeignToken>

export type V1_handleSetOperatingModeParams = FunctionArguments<typeof functions.v1_handleSetOperatingMode>
export type V1_handleSetOperatingModeReturn = FunctionReturn<typeof functions.v1_handleSetOperatingMode>

export type V1_handleSetPricingParametersParams = FunctionArguments<typeof functions.v1_handleSetPricingParameters>
export type V1_handleSetPricingParametersReturn = FunctionReturn<typeof functions.v1_handleSetPricingParameters>

export type V1_handleSetTokenTransferFeesParams = FunctionArguments<typeof functions.v1_handleSetTokenTransferFees>
export type V1_handleSetTokenTransferFeesReturn = FunctionReturn<typeof functions.v1_handleSetTokenTransferFees>

export type V1_handleUnlockNativeTokenParams = FunctionArguments<typeof functions.v1_handleUnlockNativeToken>
export type V1_handleUnlockNativeTokenReturn = FunctionReturn<typeof functions.v1_handleUnlockNativeToken>

export type V1_handleUpgradeParams = FunctionArguments<typeof functions.v1_handleUpgrade>
export type V1_handleUpgradeReturn = FunctionReturn<typeof functions.v1_handleUpgrade>

export type V2_createAgentParams = FunctionArguments<typeof functions.v2_createAgent>
export type V2_createAgentReturn = FunctionReturn<typeof functions.v2_createAgent>

export type V2_handleCallContractParams = FunctionArguments<typeof functions.v2_handleCallContract>
export type V2_handleCallContractReturn = FunctionReturn<typeof functions.v2_handleCallContract>

export type V2_handleMintForeignTokenParams = FunctionArguments<typeof functions.v2_handleMintForeignToken>
export type V2_handleMintForeignTokenReturn = FunctionReturn<typeof functions.v2_handleMintForeignToken>

export type V2_handleRegisterForeignTokenParams = FunctionArguments<typeof functions.v2_handleRegisterForeignToken>
export type V2_handleRegisterForeignTokenReturn = FunctionReturn<typeof functions.v2_handleRegisterForeignToken>

export type V2_handleSetOperatingModeParams = FunctionArguments<typeof functions.v2_handleSetOperatingMode>
export type V2_handleSetOperatingModeReturn = FunctionReturn<typeof functions.v2_handleSetOperatingMode>

export type V2_handleUnlockNativeTokenParams = FunctionArguments<typeof functions.v2_handleUnlockNativeToken>
export type V2_handleUnlockNativeTokenReturn = FunctionReturn<typeof functions.v2_handleUnlockNativeToken>

export type V2_handleUpgradeParams = FunctionArguments<typeof functions.v2_handleUpgrade>
export type V2_handleUpgradeReturn = FunctionReturn<typeof functions.v2_handleUpgrade>

export type V2_isDispatchedParams = FunctionArguments<typeof functions.v2_isDispatched>
export type V2_isDispatchedReturn = FunctionReturn<typeof functions.v2_isDispatched>

export type V2_outboundNonceParams = FunctionArguments<typeof functions.v2_outboundNonce>
export type V2_outboundNonceReturn = FunctionReturn<typeof functions.v2_outboundNonce>

export type V2_registerTokenParams = FunctionArguments<typeof functions.v2_registerToken>
export type V2_registerTokenReturn = FunctionReturn<typeof functions.v2_registerToken>

export type V2_sendMessageParams = FunctionArguments<typeof functions.v2_sendMessage>
export type V2_sendMessageReturn = FunctionReturn<typeof functions.v2_sendMessage>

export type V2_submitParams = FunctionArguments<typeof functions.v2_submit>
export type V2_submitReturn = FunctionReturn<typeof functions.v2_submit>

