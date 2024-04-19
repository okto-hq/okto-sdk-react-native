import { BuildType } from './types';
import { storeJSONLocalStorage, getJSONLocalStorage } from './storage';
import { baseUrls, AUTH_DETAILS_KEY } from './constants';
import axios, { type AxiosInstance } from 'axios';
import type { AuthDetails } from './types';
// import { getAuthDetailsPrettyString } from './utils/log-helper';

export class OktoWallet {
  private apiKey: string = '';
  private baseUrl: string = '';
  private axiosInstance: AxiosInstance | null = null;
  private authDetails: AuthDetails | null = null;

  async init(apiKey: string, buildType: BuildType = BuildType.STAGING) {
    this.apiKey = apiKey;
    this.baseUrl = `${baseUrls[buildType]}/api/v1`;
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
          const newAuthDetails = await this.refreshToken();
          if (newAuthDetails) {
            originalRequest.headers.Authorization = `Bearer ${newAuthDetails.refreshToken}`;
            return axios(originalRequest);
          }
          this.updateAuthDetails(null);
        }
        // Return the Promise rejection if refresh didn't work or error is not due to 401
        return Promise.reject(error);
      }
    );

    console.log('init done');
  }

  private async refreshToken() {
    if (this.authDetails) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/refresh_token`,
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
        const authDetails: AuthDetails = {
          authToken: response.data.data.auth_token,
          refreshToken: response.data.data.refresh_auth_token,
          deviceToken: response.data.data.device_token,
        };

        this.updateAuthDetails(authDetails);
        console.log('Refresh token: ', 'success');
        return authDetails;
      } catch (error) {
        return null;
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
        `${this.baseUrl}/authenticate`,
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
        const authDetails: AuthDetails = {
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

  async updateAuthDetails(authDetails: AuthDetails | null) {
    this.authDetails = authDetails;
    await storeJSONLocalStorage(AUTH_DETAILS_KEY, authDetails);
  }
}
