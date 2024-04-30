import { BuildType } from './types';
import { storeJSONLocalStorage, getJSONLocalStorage } from './storage';
import { baseUrls, AUTH_DETAILS_KEY, defaultTheme } from './constants';
import axios, { type AxiosInstance } from 'axios';
import * as Types from './types';
import { getQueryString } from './utils/query-helpers';
// import { getAuthDetailsPrettyString } from './utils/log-helper';

export class OktoWallet {
  private apiKey: string = '';
  private baseUrl: string = '';
  private axiosInstance: AxiosInstance | null = null;
  private authDetails: Types.AuthDetails | null = null;
  private theme: Types.Theme = defaultTheme;

  isLoggedIn(): boolean {
    return this.authDetails != null;
  }

  getAuthToken(): string | undefined {
    return this.authDetails?.authToken;
  }

  async init(apiKey: string, buildType: BuildType = BuildType.SANDBOX) {
    this.apiKey = apiKey;
    this.baseUrl = `${baseUrls[buildType]}/api`;
    this.authDetails = await getJSONLocalStorage(AUTH_DETAILS_KEY);

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });

    // Request Interceptor to add Auth tokens to every request
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authDetails?.authToken) {
          config.headers.Authorization = `Bearer ${this.authDetails.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401 errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401) {
          try {
            const newAuthDetails = await this.refreshToken(); // Attempt to refresh token
            if (newAuthDetails) {
              // Update the Authorization header with the new access token
              originalRequest.headers.Authorization = `Bearer ${newAuthDetails.authToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // Handle refresh token errors
            this.updateAuthDetails(null); // Clear auth details if refresh fails
            return Promise.reject(refreshError);
          }
        }
        // Return the Promise rejection if refresh didn't work or error is not due to 401
        this.updateAuthDetails(null);
        return Promise.reject(error);
      }
    );

    console.log('init done');
  }

  private async refreshToken(): Promise<Types.AuthDetails | null> {
    if (this.authDetails) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/v1/refresh_token`,
          {},
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${this.authDetails.authToken}`,
              'x-refresh-authorization': `Bearer ${this.authDetails.refreshToken}`,
              'x-device-token': this.authDetails.deviceToken,
              'x-api-key': this.apiKey,
            },
          }
        );
        const authDetails: Types.AuthDetails = {
          authToken: response.data.data.auth_token,
          refreshToken: response.data.data.refresh_auth_token,
          deviceToken: response.data.data.device_token,
        };

        this.updateAuthDetails(authDetails);
        console.log('Refresh token: ', 'success');
        return authDetails;
      } catch (error) {
        throw new Error('Failed to refresh token');
      }
    }
    return null;
  }

  async authenticate(
    idToken: string,
    callback: (result: any, error: any) => void
  ) {
    if (!this.axiosInstance) {
      return callback(null, new Error('SDK is not initialized'));
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/authenticate`,
        {
          id_token: idToken,
        },
        {
          headers: {
            'Accept': '*/*',
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (
        response.status === 200 &&
        response.data &&
        response.data.status === 'success'
      ) {
        //TODO check pincode flow
        const authDetails: Types.AuthDetails = {
          authToken: response.data.data.auth_token,
          refreshToken: response.data.data.refresh_auth_token,
          deviceToken: response.data.data.device_token,
        };
        this.updateAuthDetails(authDetails);
      }
      callback(response.data, null);
    } catch (error) {
      callback(null, error);
    }
  }

  async updateAuthDetails(authDetails: Types.AuthDetails | null) {
    this.authDetails = authDetails;
    await storeJSONLocalStorage(AUTH_DETAILS_KEY, authDetails);
  }

  async makeGetRequest<T>(
    endpoint: string,
    callback: Types.Callback<T>,
    queryUrl: string | null = null
  ): Promise<void> {
    if (!this.axiosInstance) {
      callback(null, new Error('SDK is not initialized'));
      return;
    }

    const url = queryUrl ? `${endpoint}?${queryUrl}` : endpoint;
    try {
      const response = await this.axiosInstance.get<Types.ApiResponse<T>>(url);
      if (response.data.status === 'success') {
        callback(response.data.data, null);
      } else {
        callback(null, new Error('Server responded with an error'));
      }
    } catch (error) {
      callback(
        null,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  async getPortfolio(
    callback: Types.Callback<Types.PortfolioData>
  ): Promise<void> {
    this.makeGetRequest<Types.PortfolioData>('/v1/portfolio', callback);
  }

  async getSupportedTokens(
    callback: Types.Callback<Types.TokensData>
  ): Promise<void> {
    this.makeGetRequest<Types.TokensData>('/v1/supported/tokens', callback);
  }

  async getSupportedNetworks(
    callback: Types.Callback<Types.NetworkData>
  ): Promise<void> {
    this.makeGetRequest<Types.NetworkData>('/v1/supported/networks', callback);
  }

  async getUserDetails(callback: Types.Callback<Types.User>): Promise<void> {
    this.makeGetRequest<Types.User>('/v1/user_from_token', callback);
  }

  async getWallets(callback: Types.Callback<Types.WalletData>): Promise<void> {
    //#TODO Check if endpoint is correct - /v1/wallet give 503 error
    this.makeGetRequest<Types.WalletData>('/v1/widget/wallet', callback);
  }

  async orderHistory(
    callback: Types.Callback<Types.OrderData>,
    query: Partial<Types.OrderQuery>
  ): Promise<void> {
    const queryString = getQueryString(query);
    this.makeGetRequest<Types.OrderData>('/v1/orders', callback, queryString);
  }

  async getNftOrderDetails(
    callback: Types.Callback<Types.NftOrderDetailsData>,
    query: Partial<Types.NftOrderDetailsQuery>
  ): Promise<void> {
    const queryString = getQueryString(query);
    this.makeGetRequest<Types.NftOrderDetailsData>(
      '/v1/nft/order_details',
      callback,
      queryString
    );
  }

  async getRawTransactionStatus(
    callback: Types.Callback<Types.RawTransactionStatusData>,
    query: Types.RawTransactionStatusQuery
  ): Promise<void> {
    const queryString = getQueryString(query);
    this.makeGetRequest<Types.RawTransactionStatusData>(
      '/v1/rawtransaction/status',
      callback,
      queryString
    );
  }

  async makePostRequest<T>(
    endpoint: string,
    callback: Types.Callback<T>,
    data: any = null
  ): Promise<void> {
    if (!this.axiosInstance) {
      callback(null, new Error('SDK is not initialized'));
      return;
    }

    try {
      const response = await this.axiosInstance.post<Types.ApiResponse<T>>(
        endpoint,
        data
      );
      if (response.data.status === 'success') {
        callback(response.data.data, null);
      } else {
        callback(null, new Error('Server responded with an error'));
      }
    } catch (error) {
      callback(
        null,
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  async createWallet(
    callback: Types.Callback<Types.WalletData>
  ): Promise<void> {
    this.makePostRequest<Types.WalletData>('/v1/wallet', callback);
  }

  async transferTokens(
    data: Types.TransferTokens,
    callback: Types.Callback<Types.TransferTokensData>
  ): Promise<void> {
    this.makePostRequest<Types.TransferTokensData>(
      '/v1/transfers/tokens/execute',
      callback,
      data
    );
  }

  async transferNft(
    data: Types.TransferNft,
    callback: Types.Callback<Types.TransferNftData>
  ): Promise<void> {
    this.makePostRequest<Types.TransferNftData>(
      '/v1/nft/transfer',
      callback,
      data
    );
  }

  async executeRawTransaction(
    data: Types.ExecuteRawTransaction,
    callback: Types.Callback<Types.ExecuteRawTransactionData>
  ): Promise<void> {
    this.makePostRequest<Types.ExecuteRawTransactionData>(
      '/v1/rawtransaction/execute',
      callback,
      data
    );
  }

  setTheme(theme: Partial<Types.Theme>){
    this.theme = { ...this.theme, ...theme};
  }

  getTheme(): Types.Theme {
    return this.theme;
  }
}

export const RnOktoSdk = new OktoWallet();
