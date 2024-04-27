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
  BottomSheetType,
  BuildType,
  type ExecuteRawTransaction,
  type NftOrderDetailsQuery,
  type OktoContextType,
  type OrderQuery,
  type RawTransactionStatusQuery,
  type Theme,
  type TransferNft,
  type TransferTokens,
} from './types';

const OktoContext = createContext<OktoContextType | null>(null);

export const OktoProvider = ({
  children,
  apiKey,
  buildType,
}: {
  children: ReactNode;
  apiKey: string;
  buildType: BuildType;
}) => {
  const oktoBottomSheetRef = useRef<any>(null);

  const showBottomSheet = (screen: BottomSheetType) => {
    if (RnOktoSdk.isLoggedIn()) {
      oktoBottomSheetRef.current?.openSheet(screen);
    } else {
      console.error('user not logged in');
    }
  };

  const closeBottomSheet = () => {
    oktoBottomSheetRef.current?.closeSheet();
  };

  function authenticate(
    idToken: string,
    callback: (result: any, error: any) => void
  ) {
    RnOktoSdk.authenticate(idToken, callback);
  }

  function getPortfolio(callback: (result: any, error: any) => void): void {
    RnOktoSdk.getPortfolio(callback);
  }

  function getSupportedNetworks(
    callback: (result: any, error: any) => void
  ): void {
    RnOktoSdk.getSupportedNetworks(callback);
  }

  function getSupportedTokens(
    callback: (result: any, error: any) => void
  ): void {
    RnOktoSdk.getSupportedTokens(callback);
  }

  function getUserDetails(callback: (result: any, error: any) => void): void {
    RnOktoSdk.getUserDetails(callback);
  }

  function getWallets(callback: (result: any, error: any) => void): void {
    RnOktoSdk.getWallets(callback);
  }

  function orderHistory(
    callback: (result: any, error: any) => void,
    query: Partial<OrderQuery> = {}
  ): void {
    RnOktoSdk.orderHistory(callback, query);
  }

  function getNftOrderDetails(
    callback: (result: any, error: any) => void,
    query: Partial<NftOrderDetailsQuery> = {}
  ): void {
    RnOktoSdk.getNftOrderDetails(callback, query);
  }

  function getRawTransactionStatus(
    callback: (result: any, error: any) => void,
    query: RawTransactionStatusQuery
  ): void {
    RnOktoSdk.getRawTransactionStatus(callback, query);
  }

  function createWallet(callback: (result: any, error: any) => void): void {
    RnOktoSdk.createWallet(callback);
  }

  function transferTokens(
    data: TransferTokens,
    callback: (result: any, error: any) => void
  ): void {
    RnOktoSdk.transferTokens(data, callback);
  }

  function transferNft(
    data: TransferNft,
    callback: (result: any, error: any) => void
  ): void {
    RnOktoSdk.transferNft(data, callback);
  }

  function executeRawTransaction(
    data: ExecuteRawTransaction,
    callback: (result: any, error: any) => void
  ): void {
    RnOktoSdk.executeRawTransaction(data, callback);
  }

  function setTheme(theme: Partial<Theme>): void {
    RnOktoSdk.setTheme(theme);
  }

  function getTheme(): Theme {
    return RnOktoSdk.getTheme();
  }

  useEffect(() => {
    RnOktoSdk.init(apiKey, buildType);
  }, [apiKey, buildType]);

  return (
    <OktoContext.Provider
      value={{
        showBottomSheet,
        closeBottomSheet,
        authenticate,
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
        transferTokens,
        executeRawTransaction,
        setTheme,
        getTheme,
      }}
    >
      {children}
      <OktoBottomSheet ref={oktoBottomSheetRef} />
    </OktoContext.Provider>
  );
};

export const useOkto = () => useContext(OktoContext);

export * from './types';
