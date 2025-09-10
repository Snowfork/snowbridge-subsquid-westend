import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v1019000 from '../v1019000'

export const messageAccepted =  {
    name: 'EthereumOutboundQueueV2.MessageAccepted',
    /**
     * Message will be committed at the end of current block. From now on, to track the
     * progress the message, use the `nonce` or the `id`.
     */
    v1019000: new EventType(
        'EthereumOutboundQueueV2.MessageAccepted',
        sts.struct({
            /**
             * ID of the message
             */
            id: v1019000.H256,
            /**
             * The nonce assigned to this message
             */
            nonce: sts.bigint(),
        })
    ),
}
