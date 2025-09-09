import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as bridgeHubPolkadotV1001002 from '../bridgeHubPolkadotV1001002'
import * as v1003000 from '../v1003000'
import * as v1006000 from '../v1006000'

export const processingFailed =  {
    name: 'MessageQueue.ProcessingFailed',
    /**
     * Message discarded due to an error in the `MessageProcessor` (usually a format error).
     */
    bridgeHubPolkadotV1001002: new EventType(
        'MessageQueue.ProcessingFailed',
        sts.struct({
            /**
             * The `blake2_256` hash of the message.
             */
            id: bridgeHubPolkadotV1001002.H256,
            /**
             * The queue of the message.
             */
            origin: bridgeHubPolkadotV1001002.AggregateMessageOrigin,
            /**
             * The error that occurred.
             * 
             * This error is pretty opaque. More fine-grained errors need to be emitted as events
             * by the `MessageProcessor`.
             */
            error: bridgeHubPolkadotV1001002.ProcessMessageError,
        })
    ),
    /**
     * Message discarded due to an error in the `MessageProcessor` (usually a format error).
     */
    v1003000: new EventType(
        'MessageQueue.ProcessingFailed',
        sts.struct({
            /**
             * The `blake2_256` hash of the message.
             */
            id: v1003000.H256,
            /**
             * The queue of the message.
             */
            origin: v1003000.AggregateMessageOrigin,
            /**
             * The error that occurred.
             * 
             * This error is pretty opaque. More fine-grained errors need to be emitted as events
             * by the `MessageProcessor`.
             */
            error: v1003000.ProcessMessageError,
        })
    ),
    /**
     * Message discarded due to an error in the `MessageProcessor` (usually a format error).
     */
    v1006000: new EventType(
        'MessageQueue.ProcessingFailed',
        sts.struct({
            /**
             * The `blake2_256` hash of the message.
             */
            id: v1006000.H256,
            /**
             * The queue of the message.
             */
            origin: v1006000.AggregateMessageOrigin,
            /**
             * The error that occurred.
             * 
             * This error is pretty opaque. More fine-grained errors need to be emitted as events
             * by the `MessageProcessor`.
             */
            error: v1006000.ProcessMessageError,
        })
    ),
}

export const processed =  {
    name: 'MessageQueue.Processed',
    /**
     * Message is processed.
     */
    bridgeHubPolkadotV1001002: new EventType(
        'MessageQueue.Processed',
        sts.struct({
            /**
             * The `blake2_256` hash of the message.
             */
            id: bridgeHubPolkadotV1001002.H256,
            /**
             * The queue of the message.
             */
            origin: bridgeHubPolkadotV1001002.AggregateMessageOrigin,
            /**
             * How much weight was used to process the message.
             */
            weightUsed: bridgeHubPolkadotV1001002.Weight,
            /**
             * Whether the message was processed.
             * 
             * Note that this does not mean that the underlying `MessageProcessor` was internally
             * successful. It *solely* means that the MQ pallet will treat this as a success
             * condition and discard the message. Any internal error needs to be emitted as events
             * by the `MessageProcessor`.
             */
            success: sts.boolean(),
        })
    ),
    /**
     * Message is processed.
     */
    v1006000: new EventType(
        'MessageQueue.Processed',
        sts.struct({
            /**
             * The `blake2_256` hash of the message.
             */
            id: v1006000.H256,
            /**
             * The queue of the message.
             */
            origin: v1006000.AggregateMessageOrigin,
            /**
             * How much weight was used to process the message.
             */
            weightUsed: v1006000.Weight,
            /**
             * Whether the message was processed.
             * 
             * Note that this does not mean that the underlying `MessageProcessor` was internally
             * successful. It *solely* means that the MQ pallet will treat this as a success
             * condition and discard the message. Any internal error needs to be emitted as events
             * by the `MessageProcessor`.
             */
            success: sts.boolean(),
        })
    ),
}
