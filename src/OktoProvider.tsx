import React, {
  useContext,
  createContext,
  type ReactNode,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
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
  type Theme,
  type TokensData,
  type TransferNft,
  type TransferNftData,
  type TransferTokens,
  type TransferTokensData,
  type User,
  type WalletData,
  type ApiResponse,
  OrderStatus,
  type SendOTPResponse,
  type OTPAuthResponse,
  AuthType,
  type BrandData,
} from './types';
import axios from 'axios';
import { getQueryString } from './utils/query-helpers';
import {
  AUTH_DETAILS_KEY,
  JOB_MAX_RETRY,
  JOB_RETRY_INTERVAL,
  baseUrls,
  defaultBrandData,
  defaultTheme,
} from './constants';
import { storeJSONLocalStorage, getJSONLocalStorage } from './utils/storage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { PortfolioScreen } from './components/PortfolioScreen';

const OktoContext = createContext<OktoContextType>(null!);

/**
 * Provider component for Okto SDK functionality
 *
 * @param {Object} props - Provider props
 * @param {ReactNode} props.children - Child components
 * @param {string} props.apiKey - API key for Okto
 * @param {BuildType} props.buildType - Build environment type
 * @param {() => Promise<string>} [props.gAuthCb] - Optional callback for Google authentication
 * @param {AuthType} [props.primaryAuth=AuthType.EMAIL] - Primary authentication method
 * @param {BrandData} [props.brandData=defaultBrandData] - Custom branding data
 */
export const OktoProvider = ({
  children,
  apiKey,
  buildType,
  gAuthCb,
  primaryAuth = AuthType.EMAIL,
  brandData = defaultBrandData,
}: {
  children: ReactNode;
  apiKey: string;
  buildType: BuildType;
  gAuthCb?: () => Promise<string>;
  primaryAuth?: AuthType;
  brandData?: BrandData;
}) => {
  const onboardingScreenRef = useRef<any>(null);
  const portfolioScreenRef = useRef<any>(null);

  const baseUrl = useMemo(() => baseUrls[buildType], [buildType]);
  const [authDetails, setAuthDetails] = useState<AuthDetails | null>(null);
  const [theme, updateTheme] = useState<Theme>(defaultTheme);
  const isLoggedIn = useMemo(() => authDetails !== null, [authDetails]);
  const [isReady, setIsReady] = useState(false);

  const axiosInstance = useMemo(() => {
    const axiosInstanceTmp = axios.create({
      baseURL: `${baseUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    });

    // Request Interceptor to add Auth tokens to every request
    axiosInstanceTmp.interceptors.request.use(
      (config) => {
        if (authDetails?.authToken) {
          config.headers.Authorization = `Bearer ${authDetails.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle 401 errors
    axiosInstanceTmp.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401) {
          try {
            const newAuthDetails = await refreshToken(); // Attempt to refresh token
            if (newAuthDetails) {
              // Update the Authorization header with the new access token
              originalRequest.headers.Authorization = `Bearer ${newAuthDetails.authToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Handle refresh token errors
            updateAuthDetails(null); // Clear auth details if refresh fails
            return Promise.reject(refreshError);
          }
        }
        // Return the Promise rejection if refresh didn't work or error is not due to 401
        return Promise.reject(error);
      },
    );

    return axiosInstanceTmp;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, authDetails, baseUrl]);

  useEffect(() => {
    updateAuthDetailsFromStorage();
  }, []);

  async function updateAuthDetailsFromStorage() {
    const storedAuthDetails = await getJSONLocalStorage(AUTH_DETAILS_KEY);
    setAuthDetails(storedAuthDetails);
    setIsReady(true);
  }

  async function updateAuthDetails(authDetailsNew: AuthDetails | null) {
    setAuthDetails(authDetailsNew);
    await storeJSONLocalStorage(AUTH_DETAILS_KEY, authDetailsNew);
  }

  async function refreshToken(): Promise<AuthDetails | null> {
    if (authDetails) {
      try {
        const response = await axios.post(
          `${baseUrl}/api/v1/refresh_token`,
          {},
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${authDetails?.authToken}`,
              'x-refresh-authorization': `Bearer ${authDetails.refreshToken}`,
              'x-device-token': authDetails.deviceToken,
              'x-api-key': apiKey,
            },
          },
        );
        const authDetailsNew: AuthDetails = {
          authToken: response.data.data.auth_token,
          refreshToken: response.data.data.refresh_auth_token,
          deviceToken: response.data.data.device_token,
        };

        updateAuthDetails(authDetailsNew);
        console.log('Refresh token: ', 'success');
        return authDetailsNew;
      } catch (error) {
        throw new Error('Failed to refresh token');
      }
    }
    return null;
  }

  async function authenticate(
    idToken: string,
    callback: (result: any, error: any) => void,
  ) {
    if (!axiosInstance || !isReady) {
      return callback(null, new Error('SDK is not initialized'));
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v2/authenticate`,
        {
          id_token: idToken,
        },
        {
          headers: {
            Accept: '*/*',
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (
        response.status === 200 &&
        response.data &&
        response.data.status === 'success'
      ) {
        //check if token in data then open pincode flow
        if (response.data.data.auth_token) {
          const authDetailsNew: AuthDetails = {
            authToken: response.data.data.auth_token,
            refreshToken: response.data.data.refresh_auth_token,
            deviceToken: response.data.data.device_token,
          };
          updateAuthDetails(authDetailsNew);
        }
        callback(response.data.data, null);
      } else {
        callback(null, new Error('Server responded with an error'));
      }
    } catch (error) {
      callback(null, error);
    }
  }

  async function authenticateWithUserId(
    userId: string,
    jwtToken: string,
    callback: (result: any, error: any) => void,
  ) {
    if (!axiosInstance || !isReady) {
      return callback(null, new Error('SDK is not initialized'));
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/jwt-authenticate`,
        {
          user_id: userId,
          auth_token: jwtToken,
        },
        {
          headers: {
            Accept: '*/*',
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      if (
        response.status === 200 &&
        response.data &&
        response.data.status === 'success'
      ) {
        const authDetailsNew: AuthDetails = {
          authToken: response.data.data.auth_token,
          refreshToken: response.data.data.refresh_auth_token,
          deviceToken: response.data.data.device_token,
        };
        updateAuthDetails(authDetailsNew);
        callback(response.data.data, null);
      } else {
        callback(null, new Error('Server responded with an error'));
      }
    } catch (error) {
      callback(null, error);
    }
  }

  async function makeGetRequest<T>(
    endpoint: string,
    queryUrl: string | null = null,
  ): Promise<T> {
    if (!axiosInstance || !isReady) {
      throw new Error('SDK is not initialized');
    }

    if (!isLoggedIn) {
      throw new Error('User is not logged in');
    }

    const url = queryUrl ? `${endpoint}?${queryUrl}` : endpoint;
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url);
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async function makePostRequest<T>(
    endpoint: string,
    data: any = null,
    requireLoggedIn: boolean = true,
  ): Promise<T> {
    if (!axiosInstance || !isReady) {
      throw new Error('SDK is not initialized');
    }

    if (requireLoggedIn && !isLoggedIn) {
      throw new Error('User is not logged in');
    }

    try {
      const response = await axiosInstance.post<ApiResponse<T>>(endpoint, data);
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async function getPortfolio(): Promise<PortfolioData> {
    return makeGetRequest<PortfolioData>('/v1/portfolio');
  }

  async function getSupportedTokens(): Promise<TokensData> {
    return makeGetRequest<TokensData>('/v1/supported/tokens');
  }

  async function getSupportedNetworks(): Promise<NetworkData> {
    return makeGetRequest<NetworkData>('/v1/supported/networks');
  }

  async function getUserDetails(): Promise<User> {
    return makeGetRequest<User>('/v1/user_from_token');
  }

  async function getWallets(): Promise<WalletData> {
    return makeGetRequest<WalletData>('/v1/wallet');
  }

  async function orderHistory(query: Partial<OrderQuery> = {}): Promise<OrderData> {
    const queryString = getQueryString(query);
    return makeGetRequest<OrderData>('/v1/orders', queryString);
  }

  async function getNftOrderDetails(
    query: Partial<NftOrderDetailsQuery>,
  ): Promise<NftOrderDetailsData> {
    const queryString = getQueryString(query);
    return makeGetRequest<NftOrderDetailsData>(
      '/v1/nft/order_details',
      queryString,
    );
  }

  async function getRawTransactionStatus(
    query: RawTransactionStatusQuery,
  ): Promise<RawTransactionStatusData> {
    const queryString = getQueryString(query);
    return makeGetRequest<RawTransactionStatusData>(
      '/v1/rawtransaction/status',
      queryString,
    );
  }

  async function createWallet(): Promise<WalletData> {
    return makePostRequest<WalletData>('/v1/wallet');
  }

  async function transferTokens(
    data: TransferTokens,
  ): Promise<TransferTokensData> {
    return makePostRequest<TransferTokensData>(
      '/v1/transfer/tokens/execute',
      data,
    );
  }

  async function transferTokensWithJobStatus(
    data: TransferTokens,
  ): Promise<Order> {
    try {
      const { orderId } = await transferTokens(data);
      console.log('Transfer tokens order ID', orderId);

      return await waitForJobCompletion<Order>(
        orderId,
        async (_orderId: string) => {
          const orderData = await orderHistory({ order_id: _orderId });
          const order = orderData.jobs.find(
            (item) => item.order_id === _orderId,
          );
          if (
            order &&
            (order.status === OrderStatus.SUCCESS ||
              order.status === OrderStatus.FAILED)
          ) {
            return order;
          }
          throw new Error(
            `Order with ID ${_orderId} not found or not completed.`,
          );
        },
      );
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async function transferNft(data: TransferNft): Promise<TransferNftData> {
    return makePostRequest<TransferNftData>('/v1/nft/transfer', data);
  }

  async function transferNftWithJobStatus(
    data: TransferNft,
  ): Promise<NftOrderDetails> {
    try {
      const { order_id } = await transferNft(data);
      console.log('Transfer nfts order ID', order_id);

      return await waitForJobCompletion<NftOrderDetails>(
        order_id,
        async (orderId: string) => {
          const orderData = await getNftOrderDetails({
            order_id: orderId,
          });
          const order = orderData.nfts.find((item) => item.id === orderId);
          if (order) {
            return order;
          }
          throw new Error(
            `Order with ID ${orderId} not found or not completed.`,
          );
        },
      );
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async function executeRawTransaction(
    data: ExecuteRawTransaction,
  ): Promise<ExecuteRawTransactionData> {
    return makePostRequest<ExecuteRawTransactionData>(
      '/v1/rawtransaction/execute',
      data,
    );
  }

  async function executeRawTransactionWithJobStatus(
    data: ExecuteRawTransaction,
  ): Promise<RawTransactionStatus> {
    try {
      const { jobId } = await executeRawTransaction(data);
      console.log('Execute Raw transaction called with Job ID', jobId);

      return await waitForJobCompletion<RawTransactionStatus>(
        jobId,
        async (orderId: string) => {
          const orderData = await getRawTransactionStatus({
            order_id: orderId,
          });
          const order = orderData.jobs.find(
            (item) => item.order_id === orderId,
          );
          if (
            order &&
            (order.status === OrderStatus.SUCCESS ||
              order.status === OrderStatus.FAILED)
          ) {
            return order;
          }
          throw new Error(
            `Order with ID ${orderId} not found or not completed.`,
          );
        },
      );
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async function waitForJobCompletion<T>(
    orderId: string,
    findJobCallback: (orderId: string) => Promise<T>,
  ): Promise<T> {
    for (let retryCount = 0; retryCount < JOB_MAX_RETRY; retryCount++) {
      try {
        return await findJobCallback(orderId);
      } catch (error) {
        /* empty */
      }
      await delay(JOB_RETRY_INTERVAL);
    }
    throw new Error('Order ID not found or not completed.');
  }

  async function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function logOut() {
    updateAuthDetails(null);
  }

  async function sendEmailOTP(email: string): Promise<SendOTPResponse> {
    return makePostRequest<SendOTPResponse>('/v1/authenticate/email', {
      email,
    }, false);
  }

  async function verifyEmailOTP(
    email: string,
    otp: string,
    token: string,
  ): Promise<boolean> {
    try {
      const response = await makePostRequest<OTPAuthResponse>(
        '/v1/authenticate/email/verify',
        { email, otp, token },
        false,
      );
      if (response.message === 'success') {
        const authDetailsNew: AuthDetails = {
          authToken: response.auth_token,
          refreshToken: response.refresh_auth_token,
          deviceToken: response.device_token,
        };
        updateAuthDetails(authDetailsNew);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  async function sendPhoneOTP(
    phoneNumber: string,
    countryShortName: string,
  ): Promise<SendOTPResponse> {
    return makePostRequest<SendOTPResponse>('/v1/authenticate/phone', {
      phone_number: phoneNumber,
      country_short_name: countryShortName,
    }, false);
  }

  async function verifyPhoneOTP(
    phoneNumber: string,
    countryShortName: string,
    otp: string,
    token: string,
  ): Promise<boolean> {
    try {
      const response = await makePostRequest<OTPAuthResponse>(
        '/v1/authenticate/phone/verify',
        {
          phone_number: phoneNumber,
          country_short_name: countryShortName,
          otp,
          token,
        },
        false,
      );
      if (response.message === 'success') {
        const authDetailsNew: AuthDetails = {
          authToken: response.auth_token,
          refreshToken: response.refresh_auth_token,
          deviceToken: response.device_token,
        };
        updateAuthDetails(authDetailsNew);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function showWidgetSheet() {
    portfolioScreenRef.current?.open();
  }

  function showOnboardingWidget() {
    onboardingScreenRef.current?.open();
  }

  function closeBottomSheet() {
    portfolioScreenRef.current?.close();
  }

  function closeOnboardingWidget() {
    onboardingScreenRef.current?.close();
  }

  function setTheme(newTheme: Partial<Theme>) {
    updateTheme({ ...theme, ...newTheme });
  }

  function getTheme(): Theme {
    return theme;
  }

  async function readContractData(
    network_name: string,
    data: any,
  ): Promise<any> {
    return makePostRequest<any>('/v1/readContractData', {
      network_name,
      data,
    });
  }

  return (
    <OktoContext.Provider
      value={{
        isLoggedIn,
        isReady,
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
        showWidgetSheet,
        closeBottomSheet,
        showOnboardingWidget,
        closeOnboardingWidget,
        setTheme,
        getTheme,
        sendEmailOTP,
        verifyEmailOTP,
        sendPhoneOTP,
        verifyPhoneOTP,
        readContractData,
        updateAuthDetails,
      }}
    >
      {children}
      <PortfolioScreen
        authToken={authDetails?.authToken}
        buildType={buildType}
        theme={theme}
        ref={portfolioScreenRef}
      />
      <OnboardingScreen
        ref={onboardingScreenRef}
        updateAuthCb={updateAuthDetails}
        gAuthCb={gAuthCb ? gAuthCb : async () => ''}
        buildType={buildType}
        apiKey={apiKey}
        primaryAuth={primaryAuth}
        brandData={brandData}
        theme={theme}
      />
    </OktoContext.Provider>
  );
};

/**
 * Hook to access Okto SDK functionality
 *
 * @returns {OktoContextType} Okto context value
 */
export const useOkto = () => {
  const context = useContext(OktoContext);
  if (context === null) {
    throw new Error('useOkto must be used within an OktoProvider');
  }
  return context as OktoContextType;
};
