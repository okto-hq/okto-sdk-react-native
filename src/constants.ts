import { BuildType, type Theme } from './types';

export const baseUrls = {
  [BuildType.PRODUCTION]: 'https://apigw.okto.tech',
  [BuildType.STAGING]: 'https://3p-bff.oktostage.com',
  [BuildType.SANDBOX]: 'https://sandbox-api.okto.tech',
};

export const onBoardingUrls = {
  [BuildType.PRODUCTION]: 'https://3p.okto.tech/login_screen/#/login_screen',
  [BuildType.STAGING]: 'https://3p.oktostage.com/#/login_screen',
  [BuildType.SANDBOX]: 'https://okto-sandbox.firebaseapp.com/#/login_screen',
};

export const widgetUrl = 'https://3p.okto.tech/';

export const AUTH_DETAILS_KEY = 'AUTH_DETAILS';

export const defaultTheme: Theme = {
  textPrimaryColor: '0xFFFFFFFF',
  textSecondaryColor: '0xFFFFFFFF',
  textTertiaryColor: '0xFFFFFFFF',
  accent1Color: '0x80433454',
  accent2Color: '0x80905BF5',
  strokeBorderColor: '0xFFACACAB',
  strokeDividerColor: '0x4DA8A8A8',
  surfaceColor: '0xFF1F0A2F',
  backgroundColor: '0xFF000000',
};

export const JOB_RETRY_INTERVAL = 5000; //5s
export const JOB_MAX_RETRY = 12; //retry for 60s (12 * 5 = 60)
