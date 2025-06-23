import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v1001002 from '../v1001002'
import * as v1002000 from '../v1002000'
import * as v1004002 from '../v1004002'

export const created =  {
    name: 'ForeignAssets.Created',
    /**
     * Some asset class was created.
     */
    v1001002: new EventType(
        'ForeignAssets.Created',
        sts.struct({
            assetId: v1001002.V3MultiLocation,
            creator: v1001002.AccountId32,
            owner: v1001002.AccountId32,
        })
    ),
    /**
     * Some asset class was created.
     */
    v1002000: new EventType(
        'ForeignAssets.Created',
        sts.struct({
            assetId: v1002000.V3MultiLocation,
            creator: v1002000.AccountId32,
            owner: v1002000.AccountId32,
        })
    ),
    /**
     * Some asset class was created.
     */
    v1004002: new EventType(
        'ForeignAssets.Created',
        sts.struct({
            assetId: v1004002.V4Location,
            creator: v1004002.AccountId32,
            owner: v1004002.AccountId32,
        })
    ),
}

export const issued =  {
    name: 'ForeignAssets.Issued',
    /**
     * Some assets were issued.
     */
    v1001002: new EventType(
        'ForeignAssets.Issued',
        sts.struct({
            assetId: v1001002.V3MultiLocation,
            owner: v1001002.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some assets were issued.
     */
    v1002000: new EventType(
        'ForeignAssets.Issued',
        sts.struct({
            assetId: v1002000.V3MultiLocation,
            owner: v1002000.AccountId32,
            amount: sts.bigint(),
        })
    ),
    /**
     * Some assets were issued.
     */
    v1004002: new EventType(
        'ForeignAssets.Issued',
        sts.struct({
            assetId: v1004002.V4Location,
            owner: v1004002.AccountId32,
            amount: sts.bigint(),
        })
    ),
}

export const burned =  {
    name: 'ForeignAssets.Burned',
    /**
     * Some assets were destroyed.
     */
    v1001002: new EventType(
        'ForeignAssets.Burned',
        sts.struct({
            assetId: v1001002.V3MultiLocation,
            owner: v1001002.AccountId32,
            balance: sts.bigint(),
        })
    ),
    /**
     * Some assets were destroyed.
     */
    v1002000: new EventType(
        'ForeignAssets.Burned',
        sts.struct({
            assetId: v1002000.V3MultiLocation,
            owner: v1002000.AccountId32,
            balance: sts.bigint(),
        })
    ),
    /**
     * Some assets were destroyed.
     */
    v1004002: new EventType(
        'ForeignAssets.Burned',
        sts.struct({
            assetId: v1004002.V4Location,
            owner: v1004002.AccountId32,
            balance: sts.bigint(),
        })
    ),
}
