import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, ManyToOne as ManyToOne_} from "@subsquid/typeorm-store"
import {MessageProcessedOnPolkadot} from "./messageProcessedOnPolkadot.model"
import {OutboundMessageAcceptedOnBridgeHub} from "./outboundMessageAcceptedOnBridgeHub.model"
import {InboundMessageDispatchedOnEthereum} from "./inboundMessageDispatchedOnEthereum.model"

/**
 * V2 transfers from Polkadot to Ethereum
 */
@Entity_()
export class TransferStatusToEthereumV2 {
    constructor(props?: Partial<TransferStatusToEthereumV2>) {
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
    tokenLocation!: string | undefined | null

    @StringColumn_({nullable: true})
    senderAddress!: string | undefined | null

    @IntColumn_({nullable: true})
    sourceParaId!: number | undefined | null

    @StringColumn_({nullable: true})
    destinationAddress!: string | undefined | null

    @BigIntColumn_({nullable: true})
    amount!: bigint | undefined | null

    @Index_()
    @ManyToOne_(() => MessageProcessedOnPolkadot, {nullable: true})
    toAssetHubMessageQueue!: MessageProcessedOnPolkadot | undefined | null

    @Index_()
    @ManyToOne_(() => MessageProcessedOnPolkadot, {nullable: true})
    toBridgeHubMessageQueue!: MessageProcessedOnPolkadot | undefined | null

    @Index_()
    @ManyToOne_(() => OutboundMessageAcceptedOnBridgeHub, {nullable: true})
    toBridgeHubOutboundQueue!: OutboundMessageAcceptedOnBridgeHub | undefined | null

    @Index_()
    @ManyToOne_(() => InboundMessageDispatchedOnEthereum, {nullable: true})
    toDestination!: InboundMessageDispatchedOnEthereum | undefined | null

    @StringColumn_({nullable: true})
    claimer!: string | undefined | null
}
