import "reflect-metadata";
import { Arg, Field, ObjectType, Query, Resolver } from "type-graphql";
import type { EntityManager } from "typeorm";

function validateLatest(latest: number): void {
  if (!Number.isInteger(latest)) {
    throw new Error("Invalid latest parameter: must be an integer");
  }
}

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
  @Field(() => Number, { nullable: true })
  paraid: number | null = null;
}

@ObjectType()
export class MaxResult {
  @Field(() => Number, { nullable: false })
  max!: number;
}

@Resolver()
export class TransferElapseResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => ElapseResult)
  async toPolkadotV2Elapse(
    @Arg("latest", {
      nullable: true,
      defaultValue: latestTransfers,
    })
    latest: number,
  ): Promise<ElapseResult> {
    validateLatest(latest);

    const manager = await this.tx();

    const query = `with to_polkadot_v2_elapse as
    (
        select transfer_status_to_polkadot_v2.timestamp as ts1, message_processed_on_polkadot.timestamp as ts2 
        from transfer_status_to_polkadot_v2 join message_processed_on_polkadot 
        on transfer_status_to_polkadot_v2.message_id = message_processed_on_polkadot.message_id
        order by ts1 desc limit $1
    )
    SELECT EXTRACT(EPOCH FROM (percentile_disc(0.7) WITHIN GROUP (ORDER BY ts2 - ts1))) as elapse FROM to_polkadot_v2_elapse
    `;

    const result: [ElapseResult] = await manager.query(query, [latest]);
    return result[0];
  }

  @Query(() => ElapseResult)
  async toEthereumV2Elapse(
    @Arg("latest", {
      nullable: true,
      defaultValue: latestTransfers,
    })
    latest: number,
  ): Promise<ElapseResult> {
    validateLatest(latest);

    const manager = await this.tx();

    const query = `with to_ethereum_v2_elapse as
    (
        select transfer_status_to_ethereum_v2.timestamp as ts1, inbound_message_dispatched_on_ethereum.timestamp as ts2 
        from transfer_status_to_ethereum_v2 join inbound_message_dispatched_on_ethereum 
        on transfer_status_to_ethereum_v2.message_id = inbound_message_dispatched_on_ethereum.message_id
        order by ts1 desc limit $1
    )
    SELECT EXTRACT(EPOCH FROM (percentile_disc(0.7) WITHIN GROUP (ORDER BY ts2 - ts1))) as elapse FROM to_ethereum_v2_elapse
    `;

    const result: [ElapseResult] = await manager.query(query, [latest]);
    return result[0];
  }

  @Query(() => ElapseResultNullable)
  async toEthereumV2UndeliveredTimeout(): Promise<ElapseResultNullable> {
    const manager = await this.tx();
    const query = `select max(EXTRACT(EPOCH FROM (NOW() - timestamp))) as elapse from transfer_status_to_ethereum_v2 where transfer_status_to_ethereum_v2.status = 0 and transfer_status_to_ethereum_v2.timestamp > NOW() - INTERVAL '3 days'`;
    const result: ElapseResultNullable[] = await manager.query(query);
    return result[0];
  }

  @Query(() => ElapseResultNullable)
  async toPolkadotV2UndeliveredTimeout(): Promise<ElapseResultNullable> {
    const manager = await this.tx();
    const query = `select max(EXTRACT(EPOCH FROM (NOW() - timestamp))) as elapse from transfer_status_to_polkadot_v2 where transfer_status_to_polkadot_v2.status = 0 and transfer_status_to_polkadot_v2.timestamp > NOW() - INTERVAL '3 days'`;
    const result: ElapseResultNullable[] = await manager.query(query);
    return result[0];
  }

  @Query(() => MaxResult)
  async toPolkadotV2LastDelivered(
    @Arg("latest", {
      nullable: false,
    })
    latest: number,
  ): Promise<MaxResult> {
    validateLatest(latest);

    const manager = await this.tx();

    const query = `SELECT max(nonce) as max FROM transfer_status_to_polkadot_v2 where status=1 and nonce<=$1 and from_v1 is NULL`;

    const result: MaxResult[] = await manager.query(query, [latest]);
    return result[0];
  }

  @Query(() => MaxResult)
  async toEthereumV2LastDelivered(
    @Arg("latest", {
      nullable: false,
    })
    latest: number,
  ): Promise<MaxResult> {
    validateLatest(latest);

    const manager = await this.tx();

    const query = `SELECT max(nonce) as max FROM transfer_status_to_ethereum_v2 where status=1 and nonce<=$1 and from_v1 is NULL`;

    const result: MaxResult[] = await manager.query(query, [latest]);
    return result[0];
  }
}

export const ProcessorRegistry: { [key: number]: any } = {
  2034: {
    paraid: 2034,
    schema: "hydration_processor",
    name: "hydration",
  },
  2043: {
    paraid: 2043,
    schema: "polkadot_neuroweb_processor",
    name: "neuroweb",
  },
  3369: {
    schema: "mythos_processor",
    paraid: 3369,
    name: "mythos",
  },
};

@Resolver()
export class SyncStatusResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [ChainStatus])
  async latestBlocks(
    @Arg("withPKBridge", {
      defaultValue: true,
    })
    withPKBridge: boolean,
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

  @Query(() => [ChainStatus])
  async latestBlocksOfParachain(
    @Arg("paraid", {
      nullable: false,
    })
    paraid: number,
  ): Promise<ChainStatus | undefined> {
    let processor: any = ProcessorRegistry[paraid];
    if (!processor) {
      return;
    }
    const manager = await this.tx();
    let query = `select '${processor.name}' as name, ${processor.paraid} as paraid, (SELECT get_sync_status('${processor.schema}') as height);`;
    let status: ChainStatus = await manager.query(query);
    return status;
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
