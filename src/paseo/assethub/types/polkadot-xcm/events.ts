import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v1001002 from '../v1001002'
import * as v1002000 from '../v1002000'
import * as v1005001 from '../v1005001'

export const sent =  {
    name: 'PolkadotXcm.Sent',
    /**
     * A XCM message was sent.
     */
    v1001002: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v1001002.V3MultiLocation,
            destination: v1001002.V3MultiLocation,
            message: sts.array(() => v1001002.V3Instruction),
            messageId: sts.bytes(),
        })
    ),
    /**
     * A XCM message was sent.
     */
    v1002000: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v1002000.V4Location,
            destination: v1002000.V4Location,
            message: sts.array(() => v1002000.V4Instruction),
            messageId: sts.bytes(),
        })
    ),
    /**
     * A XCM message was sent.
     */
    v1005001: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v1005001.V5Location,
            destination: v1005001.V5Location,
            message: sts.array(() => v1005001.V5Instruction),
            messageId: sts.bytes(),
        })
    ),
}
