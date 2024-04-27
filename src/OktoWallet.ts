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
  private idToken: string = '';

  isLoggedIn(): boolean {
    return this.authDetails != null;
  }

  getAuthToken(): string | undefined {
    return this.authDetails?.authToken;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getIdToken(): string {
    return this.idToken;
  }

  async init(apiKey: string, buildType: BuildType = BuildType.SANDBOX) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrls[buildType];
    this.authDetails = await getJSONLocalStorage(AUTH_DETAILS_KEY);

    this.axiosInstance = axios.create({
      baseURL: `${this.baseUrl}/api`,
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
          `${this.baseUrl}/api/v1/refresh_token`,
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

    this.idToken = idToken;

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/authenticate`,
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
        // console.log("Id token: ", idToken)
        // console.log("Auth token: ", authDetails.authToken)
        this.updateAuthDetails(authDetails);
      }
      callback(response.data, null);
    } catch (error) {
      callback(null, error);
    }
  }

  updateAuthFromSetPincode(response: any): void {
    if (response && response.status === 'success') {
      try {
        const authDetails: Types.AuthDetails = {
          authToken: response.data.auth_token,
          refreshToken: response.data.refresh_auth_token,
          deviceToken: response.data.device_token,
        };

        this.updateAuthDetails(authDetails);
        console.log('updateAuthFromSetPincode: ', 'success');
      } catch (error) {
        throw new Error('Failed to update auth from pincode');
      }
    }
  }

  async updateAuthDetails(authDetails: Types.AuthDetails | null) {
    this.authDetails = authDetails;
    await storeJSONLocalStorage(AUTH_DETAILS_KEY, authDetails);
  }

  async makeGetRequest<T>(
    endpoint: string,
    queryUrl: string | null = null
  ): Promise<T> {
    if (!this.axiosInstance) {
      throw new Error('SDK is not initialized');
    }

    const url = queryUrl ? `${endpoint}?${queryUrl}` : endpoint;
    try {
      const response = await this.axiosInstance.get<Types.ApiResponse<T>>(url);
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async getPortfolio(): Promise<Types.PortfolioData> {
    return this.makeGetRequest<Types.PortfolioData>('/v1/portfolio');
  }

  async getSupportedTokens(): Promise<Types.TokensData> {
    return this.makeGetRequest<Types.TokensData>('/v1/supported/tokens');
  }

  async getSupportedNetworks(): Promise<Types.NetworkData> {
    return this.makeGetRequest<Types.NetworkData>('/v1/supported/networks');
  }

  async getUserDetails(): Promise<Types.User> {
    return this.makeGetRequest<Types.User>('/v1/user_from_token');
  }

  async getWallets(): Promise<Types.WalletData> {
    return this.makeGetRequest<Types.WalletData>('/v1/widget/wallet');
  }

  async orderHistory(
    query: Partial<Types.OrderQuery>
  ): Promise<Types.OrderData> {
    const queryString = getQueryString(query);
    return this.makeGetRequest<Types.OrderData>('/v1/orders', queryString);
  }

  async getNftOrderDetails(
    query: Partial<Types.NftOrderDetailsQuery>
  ): Promise<Types.NftOrderDetailsData> {
    const queryString = getQueryString(query);
    return this.makeGetRequest<Types.NftOrderDetailsData>(
      '/v1/nft/order_details',
      queryString
    );
  }

  async getRawTransactionStatus(
    query: Types.RawTransactionStatusQuery
  ): Promise<Types.RawTransactionStatusData> {
    const queryString = getQueryString(query);
    return this.makeGetRequest<Types.RawTransactionStatusData>(
      '/v1/rawtransaction/status',
      queryString
    );
  }

  async makePostRequest<T>(endpoint: string, data: any = null): Promise<T> {
    if (!this.axiosInstance) {
      throw new Error('SDK is not initialized');
    }

    try {
      const response = await this.axiosInstance.post<Types.ApiResponse<T>>(
        endpoint,
        data
      );
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  }

  async createWallet(): Promise<Types.WalletData> {
    return this.makePostRequest<Types.WalletData>('/v1/wallet');
  }

  async transferTokens(
    data: Types.TransferTokens
  ): Promise<Types.TransferTokensData> {
    return this.makePostRequest<Types.TransferTokensData>(
      '/v1/transfers/tokens/execute',
      data
    );
  }

  async transferNft(data: Types.TransferNft): Promise<Types.TransferNftData> {
    return this.makePostRequest<Types.TransferNftData>(
      '/v1/nft/transfer',
      data
    );
  }

  async executeRawTransaction(
    data: Types.ExecuteRawTransaction
  ): Promise<Types.ExecuteRawTransactionData> {
    return this.makePostRequest<Types.ExecuteRawTransactionData>(
      '/v1/rawtransaction/execute',
      data
    );
  }

  setTheme(theme: Partial<Types.Theme>) {
    this.theme = { ...this.theme, ...theme };
  }

  getTheme(): Types.Theme {
    return this.theme;
  }
}

export const RnOktoSdk = new OktoWallet();
