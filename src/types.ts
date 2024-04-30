export enum BuildType {
  STAGING = 'STAGING',
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION',
}

export interface AuthDetails {
  authToken: string;
  refreshToken: string;
  deviceToken: string;
}

export interface Network {
  network_name: string;
  chain_id: string;
}

export interface NftOrderDetails {
  order_id: string;
  user_id: string;
  status: string;
  network_name: string;
  entity_type: string;
  collection_address: string;
  nft_id: string;
  order_type: string;
  tx_hash: string;
}

export interface Order {
  order_id: string;
  network_name: string;
  order_type: string;
  status: string;
  transaction_hash: string;
}

export interface Portfolio {
  token_name: string;
  token_image: string;
  quantity: string;
  amount_in_inr: string;
}

export interface Token {
  token_name: string;
  token_address: string;
  network_name: string;
}

export interface User {
  email: string;
  user_id: string;
  created_at: string;
  freezed: string;
  freeze_reason: string;
}

export interface Wallet {
  network_name: string;
  address: string;
}
