import "reflect-metadata";
import { Arg, Field, ObjectType, Query, Resolver } from "type-graphql";
import type { EntityManager } from "typeorm";

const AssetHubChannelId =
  "0xc173fac324158e77fb5840738a1a541f633cbec8884c6a601c567d2b376a0539";

const latestTransfers = 20;

@ObjectType()
export class ElapseResult {
  @Field(() => Number, { nullable: false })
  elapse!: number;
}

@ObjectType()
export class ElapseResultNullable {
  @Field(() => Number, { nullable: true })
  elapse: number | null = null;
}

@ObjectType()
export class ChainStatus {
  @Field(() => String, { nullable: false })
  name!: string;
  @Field(() => Number, { nullable: false })
  height!: number;
}

@Resolver()
export class TransferElapseResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => ElapseResult)
  async toPolkadotElapse(
    @Arg("channelId", {
      nullable: true,
      defaultValue: AssetHubChannelId,
    })
    channelId: string,
    @Arg("lastest", {
      nullable: true,
      defaultValue: latestTransfers,
    })
    lastest: number
  ): Promise<ElapseResult> {
    const manager = await this.tx();

    const query = `with to_polkadot_elapse as
    (
        select transfer_status_to_polkadot.timestamp as ts1, message_processed_on_polkadot.timestamp as ts2 
        from transfer_status_to_polkadot join message_processed_on_polkadot 
        on transfer_status_to_polkadot.message_id = message_processed_on_polkadot.message_id
        where transfer_status_to_polkadot.channel_id = '${channelId}' order by ts1 desc limit ${lastest}
    )
    SELECT EXTRACT(EPOCH FROM (percentile_disc(0.7) WITHIN GROUP (ORDER BY ts2 - ts1))) as elapse FROM to_polkadot_elapse
    `;

    const result: [ElapseResult] = await manager.query(query);
    return result[0];
  }

  @Query(() => ElapseResult)
  async toEthereumElapse(
    @Arg("channelId", {
      nullable: true,
      defaultValue: AssetHubChannelId,
    })
    channelId: string,
    @Arg("lastest", {
      nullable: true,
      defaultValue: latestTransfers,
    })
    lastest: number
  ): Promise<ElapseResult> {
    const manager = await this.tx();

    const query = `with to_ethereum_elapse as
    (
        select transfer_status_to_ethereum.timestamp as ts1, inbound_message_dispatched_on_ethereum.timestamp as ts2 
        from transfer_status_to_ethereum join inbound_message_dispatched_on_ethereum 
        on transfer_status_to_ethereum.message_id = inbound_message_dispatched_on_ethereum.message_id
        where transfer_status_to_ethereum.channel_id = '${channelId}' order by ts1 desc limit ${lastest}
    )
    SELECT EXTRACT(EPOCH FROM (percentile_disc(0.7) WITHIN GROUP (ORDER BY ts2 - ts1))) as elapse FROM to_ethereum_elapse
    `;

    const result: [ElapseResult] = await manager.query(query);
    return result[0];
  }

  @Query(() => [ElapseResultNullable])
  async toEthereumUndeliveredTimeout(): Promise<ElapseResultNullable[]> {
    const manager = await this.tx();
    const query = `select EXTRACT(EPOCH FROM (NOW() - timestamp)) as elapse from outbound_message_accepted_on_bridge_hub where nonce = (select (max(nonce) + 1) from inbound_message_dispatched_on_ethereum)`;
    const result: ElapseResultNullable[] = await manager.query(query);
    return result;
  }

  @Query(() => [ElapseResultNullable])
  async toPolkadotUndeliveredTimeout(): Promise<ElapseResultNullable[]> {
    const manager = await this.tx();
    const query = `select EXTRACT(EPOCH FROM (NOW() - timestamp)) as elapse from outbound_message_accepted_on_ethereum where nonce = (select (max(nonce) + 1) from inbound_message_received_on_bridge_hub)`;
    const result: ElapseResultNullable[] = await manager.query(query);
    return result;
  }

  @Query(() => ElapseResult)
  async toPolkadotV2Elapse(
    @Arg("lastest", {
      nullable: true,
      defaultValue: latestTransfers,
    })
    lastest: number
  ): Promise<ElapseResult> {
    const manager = await this.tx();

    const query = `with to_polkadot_v2_elapse as
    (
        select transfer_status_to_polkadot_v2.timestamp as ts1, message_processed_on_polkadot.timestamp as ts2 
        from transfer_status_to_polkadot_v2 join message_processed_on_polkadot 
        on transfer_status_to_polkadot_v2.message_id = message_processed_on_polkadot.message_id
        order by ts1 desc limit ${lastest}
    )
    SELECT EXTRACT(EPOCH FROM (percentile_disc(0.7) WITHIN GROUP (ORDER BY ts2 - ts1))) as elapse FROM to_polkadot_v2_elapse
    `;

    const result: [ElapseResult] = await manager.query(query);
    return result[0];
  }

  @Query(() => ElapseResult)
  async toEthereumV2Elapse(
    @Arg("lastest", {
      nullable: true,
      defaultValue: latestTransfers,
    })
    lastest: number
  ): Promise<ElapseResult> {
    const manager = await this.tx();

    const query = `with to_ethereum_v2_elapse as
    (
        select transfer_status_to_ethereum_v2.timestamp as ts1, inbound_message_dispatched_on_ethereum.timestamp as ts2 
        from transfer_status_to_ethereum_v2 join inbound_message_dispatched_on_ethereum 
        on transfer_status_to_ethereum_v2.message_id = inbound_message_dispatched_on_ethereum.message_id
        order by ts1 desc limit ${lastest}
    )
    SELECT EXTRACT(EPOCH FROM (percentile_disc(0.7) WITHIN GROUP (ORDER BY ts2 - ts1))) as elapse FROM to_ethereum_v2_elapse
    `;

    const result: [ElapseResult] = await manager.query(query);
    return result[0];
  }

  @Query(() => [ElapseResultNullable])
  async toEthereumV2UndeliveredTimeout(): Promise<ElapseResultNullable[]> {
    const manager = await this.tx();
    const query = `select max(EXTRACT(EPOCH FROM (NOW() - timestamp))) as elapse from transfer_status_to_ethereum_v2 where transfer_status_to_ethereum_v2.status = 0`;
    const result: ElapseResultNullable[] = await manager.query(query);
    return result;
  }

  @Query(() => [ElapseResultNullable])
  async toPolkadotV2UndeliveredTimeout(): Promise<ElapseResultNullable[]> {
    const manager = await this.tx();
    const query = `select max(EXTRACT(EPOCH FROM (NOW() - timestamp))) as elapse from transfer_status_to_polkadot_v2 where transfer_status_to_polkadot_v2.status = 0`;
    const result: ElapseResultNullable[] = await manager.query(query);
    return result;
  }
}

@Resolver()
export class SyncStatusResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [ChainStatus])
  async latestBlocks(
    @Arg("withPKBridge", {
      defaultValue: true,
    })
    withPKBridge: boolean
  ): Promise<ChainStatus[]> {
    const manager = await this.tx();
    let query = `select 'assethub' as name, height FROM assethub_processor.status LIMIT 1`;
    let assethub_status: [ChainStatus] = await manager.query(query);
    query = `select 'bridgehub' as name, height FROM bridgehub_processor.status LIMIT 1`;
    let bridgehub_status: [ChainStatus] = await manager.query(query);
    query = `select 'ethereum' as name, height FROM eth_processor.status LIMIT 1`;
    let ethereum_status: [ChainStatus] = await manager.query(query);
    let result = assethub_status
      .concat(bridgehub_status)
      .concat(ethereum_status);
    if (withPKBridge) {
      query = `select 'kusama_assethub' as name, height FROM kusama_assethub_processor.status LIMIT 1`;
      let kusama_assethub_status: [ChainStatus] = await manager.query(query);
      result = result.concat(kusama_assethub_status);
    }
    return result;
  }
}

@Resolver()
export class TransferToKusamaResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => ElapseResult)
  async toKusamaElapse(): Promise<ElapseResult> {
    const manager = await this.tx();

    const query = `with to_kusama_elapse as
    (
        select transfer_status_to_kusama.timestamp as ts1, message_processed_on_polkadot.timestamp as ts2 
        from transfer_status_to_kusama join message_processed_on_polkadot 
        on transfer_status_to_kusama.message_id = message_processed_on_polkadot.message_id
    )
    SELECT EXTRACT(EPOCH FROM (select avg(ts2 - ts1) from to_kusama_elapse)) as elapse
    `;

    const result: [ElapseResult] = await manager.query(query);
    return result[0];
  }

  @Query(() => ElapseResult)
  async fromKusamaElapse(): Promise<ElapseResult> {
    const manager = await this.tx();

    const query = `with from_kusama_elapse as
    (
        select transfer_status_from_kusama.timestamp as ts1, message_processed_on_polkadot.timestamp as ts2 
        from transfer_status_from_kusama join message_processed_on_polkadot 
        on transfer_status_from_kusama.message_id = message_processed_on_polkadot.message_id
    )
    SELECT EXTRACT(EPOCH FROM (select avg(ts2 - ts1) from from_kusama_elapse)) as elapse
    `;

    const result: [ElapseResult] = await manager.query(query);
    return result[0];
  }
}
