import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as bridgeHubPolkadotV1001002 from '../bridgeHubPolkadotV1001002'

export const messageReceived =  {
    name: 'EthereumInboundQueue.MessageReceived',
    /**
     * A message was received from Ethereum
     */
    bridgeHubPolkadotV1001002: new EventType(
        'EthereumInboundQueue.MessageReceived',
        sts.struct({
            /**
             * The message channel
             */
            channelId: bridgeHubPolkadotV1001002.ChannelId,
            /**
             * The message nonce
             */
            nonce: sts.bigint(),
            /**
             * ID of the XCM message which was forwarded to the final destination parachain
             */
            messageId: sts.bytes(),
            /**
             * Fee burned for the teleport
             */
            feeBurned: sts.bigint(),
        })
    ),
}
