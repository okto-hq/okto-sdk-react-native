import {
  BuildType,
  type ExecuteRawTransaction,
  type NftOrderDetailsQuery,
  type OrderQuery,
  type RawTransactionStatusQuery,
  type Theme,
  type TransferNft,
  type TransferTokens,
} from './types';

import { RnOktoSdk } from './OktoWallet';

export function isLoggedIn(): boolean {
  return RnOktoSdk.isLoggedIn();
}

export function init(apiKey: string, buildType: BuildType = BuildType.SANDBOX) {
  return RnOktoSdk.init(apiKey, buildType);
}

export function authenticate(
  idToken: string,
  callback: (result: any, error: any) => void
) {
  RnOktoSdk.authenticate(idToken, callback);
}

export function getPortfolio(callback: (result: any, error: any) => void) {
  return RnOktoSdk.getPortfolio(callback);
}

export function getSupportedNetworks(
  callback: (result: any, error: any) => void
) {
  return RnOktoSdk.getSupportedNetworks(callback);
}

export function getSupportedTokens(
  callback: (result: any, error: any) => void
) {
  return RnOktoSdk.getSupportedTokens(callback);
}

export function getUserDetails(callback: (result: any, error: any) => void) {
  return RnOktoSdk.getUserDetails(callback);
}

export function getWallets(callback: (result: any, error: any) => void) {
  return RnOktoSdk.getWallets(callback);
}

export function orderHistory(
  callback: (result: any, error: any) => void,
  query: Partial<OrderQuery> = {}
) {
  return RnOktoSdk.orderHistory(callback, query);
}

export function getNftOrderDetails(
  callback: (result: any, error: any) => void,
  query: Partial<NftOrderDetailsQuery> = {}
) {
  return RnOktoSdk.getNftOrderDetails(callback, query);
}

export function getRawTransactionStatus(
  callback: (result: any, error: any) => void,
  query: RawTransactionStatusQuery
) {
  return RnOktoSdk.getRawTransactionStatus(callback, query);
}

export function createWallet(callback: (result: any, error: any) => void) {
  return RnOktoSdk.createWallet(callback);
}

export function transferTokens(
  data: TransferTokens,
  callback: (result: any, error: any) => void
) {
  return RnOktoSdk.transferTokens(data, callback);
}

export function transferNft(
  data: TransferNft,
  callback: (result: any, error: any) => void
) {
  return RnOktoSdk.transferNft(data, callback);
}

export function executeRawTransaction(
  data: ExecuteRawTransaction,
  callback: (result: any, error: any) => void
) {
  return RnOktoSdk.executeRawTransaction(data, callback);
}

export function setTheme(
  theme: Partial<Theme>
) {
  return RnOktoSdk.setTheme(theme);
}

export function getTheme() : Theme {
  return RnOktoSdk.getTheme();
}

export * from './types';
export * from './components/OktoBottomSheetProvider';
