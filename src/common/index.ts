import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { blake2AsU8a } from "@polkadot/util-crypto";

export enum TransferStatusEnum {
  Pending,
  Complete,
  Failed,
}

export const BridgeHubParaId = 1002;

export const AssetHubParaId = 1000;

export const MoonBeamParaId = 2004;

export const HydrationParaId = 2034;

export const BifrostParaId = 2030;

export const MythosParaId = 3369;

export const AcalaParaId = 2000;

export interface ToEthereumAsset {
  location: string;
  address: string;
  amount: bigint;
}

export const toSubscanEventID = (id: string) => {
  let parts = id.split("-");
  let blockNumber = parseInt(parts[0]);
  let eventIndex = parseInt(parts[2]);
  return `${blockNumber}-${eventIndex}`;
};

export const forwardedTopicId = (messageId: string): string => {
  // From rust code
  // (b"forward_id_for", original_id).using_encoded(sp_io::hashing::blake2_256)
  const typeEncoded = stringToU8a("forward_id_for");
  const paraIdEncoded = hexToU8a(messageId);
  const joined = new Uint8Array([...typeEncoded, ...paraIdEncoded]);
  const newTopicId = blake2AsU8a(joined, 256);
  return u8aToHex(newTopicId);
};

const registedAssets: any = {
  polkadot: {
    // DOT
    "0x196C20DA81Fbc324EcdF55501e95Ce9f0bD84d14":
      '{"parents":1,"interior":{"__kind":"X1","value":[{"__kind":"GlobalConsensus","value":{"__kind":"Polkadot"}}]}}',
    // KSM
    "0x12bbfDc9e813614eEf8Dc8A2560b0EfBeaf7C2AB":
      '{"parents":1,"interior":{"__kind":"X1","value":[{"__kind":"GlobalConsensus","value":{"__kind":"Kusama"}}]}}',
    // PINK
    "0xa37B046782518A80e2E69056009FBD0431d36E50":
      '{"parents":1,"interior":{"__kind":"X4","value":[{"__kind":"GlobalConsensus","value":{"__kind":"Polkadot"}},{"__kind":"Parachain","value":1000},{"__kind":"PalletInstance","value":50},{"__kind":"GeneralIndex","value":"23"}]}}',
    // KOL
    "0x21FaB0eA070F162180447881D5873Cf3d57200d6":
      '{"parents":1,"interior":{"__kind":"X4","value":[{"__kind":"GlobalConsensus","value":{"__kind":"Polkadot"}},{"__kind":"Parachain","value":1000},{"__kind":"PalletInstance","value":50},{"__kind":"GeneralIndex","value":"86"}]}}',
    // DED
    "0x92262680A8d6636bbA9bFFDf484c274cA2de6400":
      '{"parents":1,"interior":{"__kind":"X4","value":[{"__kind":"GlobalConsensus","value":{"__kind":"Polkadot"}},{"__kind":"Parachain","value":1000},{"__kind":"PalletInstance","value":50},{"__kind":"GeneralIndex","value":"30"}]}}',
    // WUD
    "0x5FDcD48F09FB67de3D202cd854B372AEC1100ED5":
      '{"parents":1,"interior":{"__kind":"X4","value":[{"__kind":"GlobalConsensus","value":{"__kind":"Polkadot"}},{"__kind":"Parachain","value":1000},{"__kind":"PalletInstance","value":50},{"__kind":"GeneralIndex","value":"31337"}]}}',
  },
  westend: {
    // WND
    "0xf50fb50d65c8c1f6c72e4d8397c984933afc8f7e":
      '{"parents":1,"interior":{"__kind":"X1","value":[{"__kind":"GlobalConsensus","value":{"__kind":"ByGenesis","value":"0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"}}]}}',
  },
};

export const findTokenAddress = (network: string, tokenId: string): string => {
  let assets: any = registedAssets[network];
  if (assets) {
    for (const [key, value] of Object.entries(assets)) {
      if (value == tokenId) {
        return key;
      }
    }
    return "";
  }
  return "";
};
