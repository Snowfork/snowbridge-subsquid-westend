import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'

export const messageReceived =  {
    name: 'EthereumInboundQueueV2.MessageReceived',
    /**
     * A message was received from Ethereum
     */
    v1019000: new EventType(
        'EthereumInboundQueueV2.MessageReceived',
        sts.struct({
            /**
             * The message nonce
             */
            nonce: sts.bigint(),
            /**
             * ID of the XCM message which was forwarded to the final destination parachain
             */
            messageId: sts.bytes(),
        })
    ),
}
