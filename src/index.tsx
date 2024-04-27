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
  type ExecuteRawTransactionData,
  type NetworkData,
  type NftOrderDetailsData,
  type NftOrderDetailsQuery,
  type OktoContextType,
  type OrderData,
  type OrderQuery,
  type PortfolioData,
  type RawTransactionStatusData,
  type RawTransactionStatusQuery,
  type Theme,
  type TokensData,
  type TransferNft,
  type TransferNftData,
  type TransferTokens,
  type TransferTokensData,
  type User,
  type WalletData,
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

  const showBottomSheet = (
    screen: BottomSheetType,
    callback: (success: boolean) => void
  ) => {
    if (RnOktoSdk.isLoggedIn()) {
      oktoBottomSheetRef.current?.openSheet(screen, callback);
    } else {
      console.error('user not logged in');
    }
  };

  const showPinSheet = (callback: (success: boolean) => void) => {
    showBottomSheet(BottomSheetType.PIN, callback);
  };

  const showWidgetSheet = () => {
    showBottomSheet(BottomSheetType.WIDGET, () => {});
  };

  const closeBottomSheet = () => {
    oktoBottomSheetRef.current?.closeSheet();
  };

  function authenticate(
    idToken: string,
    callback: (result: any, error: any) => void
  ) {
    RnOktoSdk.authenticate(idToken, (result, error) => {
      if (result) {
        if (result.token) {
          showPinSheet((res: boolean) => {
            if (res) {
              callback(true, null);
              return;
            }
          });
          callback(null, new Error('Pin code not set'));
        } else {
          // Normal auth flow
          callback(true, null);
        }
      }
      if (error) {
        callback(null, error);
      }
    });
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

  function transferNft(data: TransferNft): Promise<TransferNftData> {
    return RnOktoSdk.transferNft(data);
  }

  function executeRawTransaction(
    data: ExecuteRawTransaction
  ): Promise<ExecuteRawTransactionData> {
    return RnOktoSdk.executeRawTransaction(data);
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
        showPinSheet,
        showWidgetSheet,
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
