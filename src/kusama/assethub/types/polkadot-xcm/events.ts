import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v1 from '../v1'
import * as v4 from '../v4'
import * as v504 from '../v504'
import * as v700 from '../v700'
import * as v9370 from '../v9370'
import * as v9382 from '../v9382'
import * as v1000000 from '../v1000000'
import * as v1002000 from '../v1002000'
import * as v1005001 from '../v1005001'

export const sent =  {
    name: 'PolkadotXcm.Sent',
    v1: new EventType(
        'PolkadotXcm.Sent',
        sts.tuple([v1.MultiLocation, v1.MultiLocation, v1.Xcm])
    ),
    v4: new EventType(
        'PolkadotXcm.Sent',
        sts.tuple([v4.MultiLocation, v4.MultiLocation, v4.Xcm])
    ),
    /**
     * A XCM message was sent.
     * 
     * \[ origin, destination, message \]
     */
    v504: new EventType(
        'PolkadotXcm.Sent',
        sts.tuple([v504.V1MultiLocation, v504.V1MultiLocation, sts.array(() => v504.V2Instruction)])
    ),
    /**
     * A XCM message was sent.
     * 
     * \[ origin, destination, message \]
     */
    v700: new EventType(
        'PolkadotXcm.Sent',
        sts.tuple([v700.V1MultiLocation, v700.V1MultiLocation, sts.array(() => v700.V2Instruction)])
    ),
    /**
     * A XCM message was sent.
     * 
     * \[ origin, destination, message \]
     */
    v9370: new EventType(
        'PolkadotXcm.Sent',
        sts.tuple([v9370.V1MultiLocation, v9370.V1MultiLocation, sts.array(() => v9370.V2Instruction)])
    ),
    /**
     * A XCM message was sent.
     * 
     * \[ origin, destination, message \]
     */
    v9382: new EventType(
        'PolkadotXcm.Sent',
        sts.tuple([v9382.V3MultiLocation, v9382.V3MultiLocation, sts.array(() => v9382.V3Instruction)])
    ),
    /**
     * A XCM message was sent.
     */
    v1000000: new EventType(
        'PolkadotXcm.Sent',
        sts.struct({
            origin: v1000000.V3MultiLocation,
            destination: v1000000.V3MultiLocation,
            message: sts.array(() => v1000000.V3Instruction),
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
