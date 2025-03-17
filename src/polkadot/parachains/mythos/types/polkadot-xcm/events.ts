import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v1000 from '../v1000'
import * as v1013 from '../v1013'

export const sent =  {
    name: 'PolkadotXcm.Sent',
    /**
     * A XCM message was sent.
     */
    v1000: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v1000.V4Location,
            destination: v1000.V4Location,
            message: sts.array(() => v1000.V4Instruction),
            messageId: sts.bytes(),
        })
    ),
    /**
     * A XCM message was sent.
     */
    v1013: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v1013.V5Location,
            destination: v1013.V5Location,
            message: sts.array(() => v1013.V5Instruction),
            messageId: sts.bytes(),
        })
    ),
}
