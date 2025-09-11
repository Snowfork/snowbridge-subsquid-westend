import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v145 from '../v145'

export const sent =  {
    name: 'PolkadotXcm.Sent',
    /**
     * A XCM message was sent.
     */
    v145: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v145.V4Location,
            destination: v145.V4Location,
            message: sts.array(() => v145.V4Instruction),
            messageId: sts.bytes(),
        })
    ),
}
