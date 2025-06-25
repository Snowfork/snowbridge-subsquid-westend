import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v164 from '../v164'

export const sent =  {
    name: 'PolkadotXcm.Sent',
    /**
     * An XCM message was sent.
     */
    v164: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v164.V5Location,
            destination: v164.V5Location,
            message: sts.array(() => v164.V5Instruction),
            messageId: sts.bytes(),
        })
    ),
}
