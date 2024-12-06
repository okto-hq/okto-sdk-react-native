import React, {
  useRef,
  useContext,
  createContext,
  type ReactNode,
  useEffect,
} from 'react';
import { OktoBottomSheet } from './components/OktoBottomSheet';
import { RnOktoSdk } from './OktoWallet';
import {
  AuthType,
  BuildType,
  type AuthDetails,
  type ExecuteRawTransaction,
  type ExecuteRawTransactionData,
  type NetworkData,
  type NftOrderDetails,
  type NftOrderDetailsData,
  type NftOrderDetailsQuery,
  type OktoContextType,
  type Order,
  type OrderData,
  type OrderQuery,
  type PortfolioData,
  type RawTransactionStatus,
  type RawTransactionStatusData,
  type RawTransactionStatusQuery,
  type SendOTPResponse,
  type Theme,
  type TokensData,
  type TransferNft,
  type TransferNftData,
  type TransferTokens,
  type TransferTokensData,
  type User,
  type WalletData,
} from './types';
import { OnboardingWidget } from './components/OnboardingWidget';

const OktoContext = createContext<OktoContextType | null>(null);

export const OktoProvider = ({
  children,
  apiKey,
  buildType,
  gAuthCb,
}: {
  children: ReactNode;
  apiKey: string;
  buildType: BuildType;
  gAuthCb?: () => Promise<string>;
}) => {
  const oktoBottomSheetRef = useRef<any>(null);
  const onboardingWidgetRef = useRef<any>(null);

  const showWidgetSheet = () => {
    if (RnOktoSdk.isLoggedIn()) {
      oktoBottomSheetRef.current?.openSheet();
    } else {
      console.error('user not logged in');
    }
  };

  const closeBottomSheet = () => {
    oktoBottomSheetRef.current?.closeSheet();
  };

  const showOnboardingWidget = (
    primaryAuth: AuthType = AuthType.EMAIL,
    title: string = '',
    subtitle: string = '',
    iconUrl: string = ''
  ) => {
    onboardingWidgetRef.current?.openSheet(primaryAuth, title, subtitle, iconUrl);
  };

  const closeOnboardingWidget = () => {
    onboardingWidgetRef.current?.closeSheet();
  };


  function authenticate(
    idToken: string,
    callback: (result: boolean, error: Error | null) => void
  ) {
    RnOktoSdk.authenticate(idToken, callback);
  }

  function authenticateWithUserId(
    userId: string,
    jwtToken: string,
    callback: (result: boolean, error: Error | null) => void
  ) {
    RnOktoSdk.authenticateWithUserId(userId, jwtToken, callback);
  }

  async function logOut() {
    await RnOktoSdk.logOut();
  }

  function getPortfolio(): Promise<PortfolioData> {
    return RnOktoSdk.getPortfolio();
  }

  function getSupportedNetworks(): Promise<NetworkData> {
    return RnOktoSdk.getSupportedNetworks();
  }

  function getSupportedTokens(): Promise<TokensData> {
    return RnOktoSdk.getSupportedTokens();
  }

  function getUserDetails(): Promise<User> {
    return RnOktoSdk.getUserDetails();
  }

  function getWallets(): Promise<WalletData> {
    return RnOktoSdk.getWallets();
  }

  function orderHistory(query: Partial<OrderQuery> = {}): Promise<OrderData> {
    return RnOktoSdk.orderHistory(query);
  }

  function getNftOrderDetails(
    query: Partial<NftOrderDetailsQuery> = {}
  ): Promise<NftOrderDetailsData> {
    return RnOktoSdk.getNftOrderDetails(query);
  }

  function getRawTransactionStatus(
    query: RawTransactionStatusQuery
  ): Promise<RawTransactionStatusData> {
    return RnOktoSdk.getRawTransactionStatus(query);
  }

  function createWallet(): Promise<WalletData> {
    return RnOktoSdk.createWallet();
  }

  function transferTokens(data: TransferTokens): Promise<TransferTokensData> {
    return RnOktoSdk.transferTokens(data);
  }

  function transferTokensWithJobStatus(data: TransferTokens): Promise<Order> {
    return RnOktoSdk.transferTokensWithJobStatus(data);
  }

  function transferNft(data: TransferNft): Promise<TransferNftData> {
    return RnOktoSdk.transferNft(data);
  }

  function transferNftWithJobStatus(
    data: TransferNft
  ): Promise<NftOrderDetails> {
    return RnOktoSdk.transferNftWithJobStatus(data);
  }

  function executeRawTransaction(
    data: ExecuteRawTransaction
  ): Promise<ExecuteRawTransactionData> {
    return RnOktoSdk.executeRawTransaction(data);
  }

  function executeRawTransactionWithJobStatus(
    data: ExecuteRawTransaction
  ): Promise<RawTransactionStatus> {
    return RnOktoSdk.executeRawTransactionWithJobStatus(data);
  }

  function setTheme(theme: Partial<Theme>): void {
    RnOktoSdk.setTheme(theme);
  }

  function getTheme(): Theme {
    return RnOktoSdk.getTheme();
  }

  function sendEmailOTP(email: string): Promise<SendOTPResponse> {
    return RnOktoSdk.sendEmailOTP(email);
  }

  function verifyEmailOTP(email: string, otp: string, token: string): Promise<boolean> {
    return RnOktoSdk.verifyEmailOTP(email, otp, token);
  }

  function sendPhoneOTP(phoneNumber: string, countryShortName: string): Promise<SendOTPResponse> {
    return RnOktoSdk.sendPhoneOTP(phoneNumber, countryShortName);
  }

  function verifyPhoneOTP(phoneNumber: string, countryShortName: string, otp: string, token: string): Promise<boolean> {
    return RnOktoSdk.verifyPhoneOTP(phoneNumber, countryShortName, otp, token);
  }

  async function updateAuthDetails(authDetails: AuthDetails| null) {
    await RnOktoSdk.updateAuthDetails(authDetails);
  }

  async function readContractData(
    network_name: string,
    data: any,
  ): Promise<any> {
    return RnOktoSdk.readContractData(network_name, data);
  }

  useEffect(() => {
    RnOktoSdk.init(apiKey, buildType);
  }, [apiKey, buildType]);

  return (
    <OktoContext.Provider
      value={{
        updateAuthDetails,
        showWidgetSheet,
        closeBottomSheet,
        authenticate,
        authenticateWithUserId,
        logOut,
        getPortfolio,
        getSupportedNetworks,
        getSupportedTokens,
        getUserDetails,
        getWallets,
        orderHistory,
        getNftOrderDetails,
        getRawTransactionStatus,
        createWallet,
        transferNft,
        transferNftWithJobStatus,
        transferTokens,
        transferTokensWithJobStatus,
        executeRawTransaction,
        executeRawTransactionWithJobStatus,
        setTheme,
        getTheme,
        sendEmailOTP,
        verifyEmailOTP,
        sendPhoneOTP,
        verifyPhoneOTP,
        showOnboardingWidget,
        closeOnboardingWidget,
        readContractData,
      }}
    >
      {children}
      <OktoBottomSheet ref={oktoBottomSheetRef} />
      <OnboardingWidget ref={onboardingWidgetRef} gAuthCb={gAuthCb ? gAuthCb : async () => ''} />
    </OktoContext.Provider>
  );
};

export const useOkto = () => useContext(OktoContext);

export * from './types';
