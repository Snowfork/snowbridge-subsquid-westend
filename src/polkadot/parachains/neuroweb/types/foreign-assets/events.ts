import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v145 from '../v145'

export const created =  {
    name: 'ForeignAssets.Created',
    /**
     * Some asset class was created.
     */
    v145: new EventType(
        'ForeignAssets.Created',
        sts.struct({
            assetId: v145.V4Location,
            creator: v145.AccountId32,
            owner: v145.AccountId32,
        })
    ),
}

export const issued =  {
    name: 'ForeignAssets.Issued',
    /**
     * Some assets were issued.
     */
    v145: new EventType(
        'ForeignAssets.Issued',
        sts.struct({
            assetId: v145.V4Location,
            owner: v145.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const burned =  {
    name: 'ForeignAssets.Burned',
    /**
     * Some assets were destroyed.
     */
    v145: new EventType(
        'ForeignAssets.Burned',
        sts.struct({
            assetId: v145.V4Location,
            owner: v145.AccountId32,
            balance: sts.bigint(),
        })
    ),
}
