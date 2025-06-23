import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as bridgeHubPolkadotV1001002 from '../bridgeHubPolkadotV1001002'

export const messageAccepted =  {
    name: 'EthereumOutboundQueue.MessageAccepted',
    /**
     * Message will be committed at the end of current block. From now on, to track the
     * progress the message, use the `nonce` of `id`.
     */
    bridgeHubPolkadotV1001002: new EventType(
        'EthereumOutboundQueue.MessageAccepted',
        sts.struct({
            /**
             * ID of the message
             */
            id: bridgeHubPolkadotV1001002.H256,
            /**
             * The nonce assigned to this message
             */
            nonce: sts.bigint(),
        })
    ),
}
