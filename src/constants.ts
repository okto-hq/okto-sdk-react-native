import { BuildType } from './types';

export const baseUrls = {
  [BuildType.PRODUCTION]: 'https://apigw.okto.tech',
  [BuildType.STAGING]: 'https://3p-bff.oktostage.com',
  [BuildType.SANDBOX]: 'https://sandbox-api.okto.tech',
};

export const AUTH_DETAILS_KEY = 'AUTH_DETAILS';
