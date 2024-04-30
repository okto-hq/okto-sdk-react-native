import { OktoWallet } from './OktoWallet';
import { BuildType } from './types';

const RnOktoSdk = new OktoWallet();

export function init(apiKey: string, buildType: BuildType = BuildType.SANDBOX) {
  return RnOktoSdk.init(apiKey, buildType);
}

export function authenticate(
  idToken: string,
  callback: (result: any, error: any) => void
) {
  RnOktoSdk.authenticate(idToken, callback);
}

export * from './types';
