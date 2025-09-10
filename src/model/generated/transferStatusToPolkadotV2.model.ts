import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, ManyToOne as ManyToOne_} from "@subsquid/typeorm-store"
import {InboundMessageReceivedOnBridgeHub} from "./inboundMessageReceivedOnBridgeHub.model"
import {MessageProcessedOnPolkadot} from "./messageProcessedOnPolkadot.model"

/**
 * V2 transfers from Ethereum to Polkadot
 */
@Entity_()
export class TransferStatusToPolkadotV2 {
    constructor(props?: Partial<TransferStatusToPolkadotV2>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    messageId!: string

    @Index_()
    @StringColumn_({nullable: false})
    txHash!: string

    @Index_()
    @IntColumn_({nullable: false})
    blockNumber!: number

    @Index_()
    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @Index_()
    @IntColumn_({nullable: true})
    nonce!: number | undefined | null

    @Index_()
    @IntColumn_({nullable: true})
    status!: number | undefined | null

    @StringColumn_({nullable: true})
    tokenAddress!: string | undefined | null

    @StringColumn_({nullable: true})
    tokenID!: string | undefined | null

    @StringColumn_({nullable: true})
    tokenLocation!: string | undefined | null

    @StringColumn_({nullable: true})
    senderAddress!: string | undefined | null

    @StringColumn_({nullable: true})
    sourceNetwork!: string | undefined | null

    @IntColumn_({nullable: true})
    sourceParaId!: number | undefined | null

    @StringColumn_({nullable: true})
    destinationNetwork!: string | undefined | null

    @IntColumn_({nullable: true})
    destinationParaId!: number | undefined | null

    @StringColumn_({nullable: true})
    destinationAddress!: string | undefined | null

    @BigIntColumn_({nullable: true})
    amount!: bigint | undefined | null

    @Index_()
    @ManyToOne_(() => InboundMessageReceivedOnBridgeHub, {nullable: true})
    toBridgeHubInboundQueue!: InboundMessageReceivedOnBridgeHub | undefined | null

    @Index_()
    @ManyToOne_(() => MessageProcessedOnPolkadot, {nullable: true})
    toAssetHubMessageQueue!: MessageProcessedOnPolkadot | undefined | null

    @Index_()
    @ManyToOne_(() => MessageProcessedOnPolkadot, {nullable: true})
    toDestination!: MessageProcessedOnPolkadot | undefined | null

    @StringColumn_({nullable: true})
    claimer!: string | undefined | null
}
