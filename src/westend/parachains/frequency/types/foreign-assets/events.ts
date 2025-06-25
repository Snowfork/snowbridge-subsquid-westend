import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v164 from '../v164'

export const created =  {
    name: 'ForeignAssets.Created',
    /**
     * Some asset class was created.
     */
    v164: new EventType(
        'ForeignAssets.Created',
        sts.struct({
            assetId: v164.V5Location,
            creator: v164.AccountId32,
            owner: v164.AccountId32,
        })
    ),
}

export const issued =  {
    name: 'ForeignAssets.Issued',
    /**
     * Some assets were issued.
     */
    v164: new EventType(
        'ForeignAssets.Issued',
        sts.struct({
            assetId: v164.V5Location,
            owner: v164.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const burned =  {
    name: 'ForeignAssets.Burned',
    /**
     * Some assets were destroyed.
     */
    v164: new EventType(
        'ForeignAssets.Burned',
        sts.struct({
            assetId: v164.V5Location,
            owner: v164.AccountId32,
            balance: sts.bigint(),
        })
    ),
}
