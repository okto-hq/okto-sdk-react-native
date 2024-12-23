import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { OktoWallet } from '../OktoWallet';
import { AUTH_DETAILS_KEY, baseUrls } from '../constants';
import * as Types from '../types';
import { mockAuthDetails, mockAuthenticateData, mockNetworkData, mockNftOrderData, mockNftTransferData, mockOrderData, mockPortfolioData, mockRawTransactionData, mockRawTransactionStatusData, mockTokensData, mockTransferTokensData, mockUserData, mockWalletData} from '../../__mocks__/mockResponses';
import { getJSONLocalStorage, storeJSONLocalStorage } from '../utils/storage';
jest.mock('../storage');

// Mock axios and storage methods
const mockAxios = new MockAdapter(axios);

const buildType = Types.BuildType.SANDBOX;
const baseUrl = baseUrls[buildType];
const apiKey = 'test-api-key';
const idToken = 'test-id-token';



async function authenticateWallet(oktoWallet: any, _idToken: string) {
    return new Promise((resolve, reject) => {
        oktoWallet.authenticate(_idToken, (result: any, error: any) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

describe('OktoWallet', () => {
  let oktoWallet: OktoWallet;

  beforeEach(async () => {
    oktoWallet = new OktoWallet();
    await oktoWallet.init(apiKey);
    //@ts-ignore
    getJSONLocalStorage.mockResolvedValue(null);
  });

  afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  it('should initialize with given API key and build type', async () => {
    await oktoWallet.init(apiKey, buildType);

    expect(oktoWallet.getApiKey()).toBe(apiKey);
    expect(oktoWallet.getBuildType()).toBe(buildType);
    expect(oktoWallet.getBaseUrl()).toBe(baseUrls[buildType]);

    // console.log(await getJSONLocalStorage(AUTH_DETAILS_KEY))
  });

  it('should authenticate a user with idToken and set auth details', async () => {
    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, mockAuthenticateData);

    await authenticateWallet(oktoWallet, idToken);
    expect(oktoWallet.isLoggedIn()).toBe(true);

  });

  it('should handle failed authentication', async () => {
    await oktoWallet.logOut();
    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(401);

    await expect(authenticateWallet(oktoWallet, idToken)).rejects.toBeDefined();
    expect(oktoWallet.isLoggedIn()).toBe(false);
  });

  it('should refresh token if session expired and retry original request', async () => {
    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, mockAuthenticateData);
    mockAxios.onPost(`${baseUrl}/api/v1/refresh_token`).reply(200, mockAuthenticateData);
    mockAxios.onGet(`${baseUrl}/api/v1/portfolio`).replyOnce(401).onGet(`${baseUrl}/api/v1/portfolio`).reply(200, mockPortfolioData);

    await authenticateWallet(oktoWallet, idToken);

    //@ts-ignore
    getJSONLocalStorage.mockResolvedValue(mockAuthDetails);

    const portfolioData = await oktoWallet.getPortfolio();
    expect(portfolioData).toEqual(mockPortfolioData.data);
    expect(storeJSONLocalStorage).toHaveBeenCalledWith(AUTH_DETAILS_KEY, mockAuthDetails);
  });

  it('should handle refresh token failure', async () => {
    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, mockAuthenticateData);
    mockAxios.onPost(`${baseUrl}/api/v1/refresh_token`).reply(401);
    mockAxios.onGet(`${baseUrl}/api/v1/portfolio`).reply(401);

    await authenticateWallet(oktoWallet, idToken);

    await expect(oktoWallet.getPortfolio()).rejects.toThrow('Failed to refresh token');
    expect(oktoWallet.isLoggedIn()).toBe(false);
    expect(storeJSONLocalStorage).toHaveBeenCalledWith(AUTH_DETAILS_KEY, null);
  });

  it('should fetch portfolio data', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/portfolio`).reply(200, mockPortfolioData);

    const portfolioData = await oktoWallet.getPortfolio();
    expect(portfolioData).toEqual(mockPortfolioData.data);
  });

  it('should log out and clear auth details', async () => {
    await oktoWallet.logOut();

    expect(oktoWallet.isLoggedIn()).toBe(false);
    expect(storeJSONLocalStorage).toHaveBeenCalledWith(AUTH_DETAILS_KEY, null);
  });

  it('should set and get the theme', () => {
    const newTheme = { textPrimaryColor: '#FFFFFF' };
    oktoWallet.setTheme(newTheme);

    const theme = oktoWallet.getTheme();
    expect(theme.textPrimaryColor).toBe('#FFFFFF');
  });

  //API Request tests
  it('should handle failed portfolio data fetch', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/portfolio`).reply(500);

    await expect(oktoWallet.getPortfolio()).rejects.toThrow('Request failed with status code 500');
  });

  it('should fetch supported tokens', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/supported/tokens`).reply(200, mockTokensData);

    const tokensData = await oktoWallet.getSupportedTokens();
    expect(tokensData).toEqual(mockTokensData.data);
  });

  it('should handle failed supported tokens fetch', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/supported/tokens`).reply(500);

    await expect(oktoWallet.getSupportedTokens()).rejects.toThrow('Request failed with status code 500');
  });

  it('should fetch supported networks', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/supported/networks`).reply(200, mockNetworkData);

    const networkData = await oktoWallet.getSupportedNetworks();
    expect(networkData).toEqual(mockNetworkData.data);
  });

  it('should handle failed supported networks fetch', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/supported/networks`).reply(500);

    await expect(oktoWallet.getSupportedNetworks()).rejects.toThrow('Request failed with status code 500');
  });

  it('should fetch user details', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/user_from_token`).reply(200, mockUserData);

    const userData = await oktoWallet.getUserDetails();
    expect(userData).toEqual(mockUserData.data);
  });

  it('should handle failed user details fetch', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/user_from_token`).reply(500);

    await expect(oktoWallet.getUserDetails()).rejects.toThrow('Request failed with status code 500');
  });

  it('should fetch wallets', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/widget/wallet`).reply(200, mockWalletData);

    const walletData = await oktoWallet.getWallets();
    expect(walletData).toEqual(mockWalletData.data);
  });

  it('should handle failed wallets fetch', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/widget/wallet`).reply(500);

    await expect(oktoWallet.getWallets()).rejects.toThrow('Request failed with status code 500');
  });

  it('should fetch order history', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/orders`).reply(200, mockOrderData);

    const orderData = await oktoWallet.orderHistory({});
    expect(orderData).toEqual(mockOrderData.data);
  });

  it('should handle failed order history fetch', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/orders`).reply(500);

    await expect(oktoWallet.orderHistory({})).rejects.toThrow('Request failed with status code 500');
  });

  it('should fetch NFT order history', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/nft/order_details`).reply(200, mockNftOrderData);

    const orderData = await oktoWallet.getNftOrderDetails({});
    expect(orderData).toEqual(mockNftOrderData.data);
  });

  it('should transfer tokens and return order data', async () => {
    mockAxios.onPost(`${baseUrl}/api/v1/transfer/tokens/execute`).reply(200, mockTransferTokensData);

    const transferData = await oktoWallet.transferTokens({} as Types.TransferTokens);
    expect(transferData).toEqual(mockTransferTokensData.data);
  });

  it('should handle failed token transfer', async () => {
    mockAxios.onPost(`${baseUrl}/api/v1/transfer/tokens/execute`).reply(500);

    await expect(oktoWallet.transferTokens({} as Types.TransferTokens)).rejects.toThrow('Request failed with status code 500');
  });

  it('should handle server failed for token transfer', async () => {
    mockAxios
      .onPost(`${baseUrl}/api/v1/transfer/tokens/execute`)
      .reply(200, { status: 'failed', data: mockTransferTokensData.data });

    await expect(oktoWallet.transferTokens({} as Types.TransferTokens)).rejects.toThrow('Server responded with an error');
  });

  it('should transfer NFT and return order details', async () => {
    mockAxios.onPost(`${baseUrl}/api/v1/nft/transfer`).reply(200, mockNftTransferData);

    const transferData = await oktoWallet.transferNft({} as Types.TransferNft);
    expect(transferData).toEqual(mockNftTransferData.data);
  });

  it('should handle failed NFT transfer', async () => {
    mockAxios.onPost(`${baseUrl}/api/v1/nft/transfer`).reply(500);

    await expect(oktoWallet.transferNft({} as Types.TransferNft)).rejects.toThrow('Request failed with status code 500');
  });

  it('should execute raw transaction and return data', async () => {
    mockAxios.onPost(`${baseUrl}/api/v1/rawtransaction/execute`).reply(200, mockRawTransactionData);

    const transactionData = await oktoWallet.executeRawTransaction({} as Types.ExecuteRawTransaction);
    expect(transactionData).toEqual(mockRawTransactionData.data);
  });

  it('should handle failed raw transaction execution', async () => {
    mockAxios.onPost(`${baseUrl}/api/v1/rawtransaction/execute`).reply(500);

    await expect(oktoWallet.executeRawTransaction({} as Types.ExecuteRawTransaction)).rejects.toThrow('Request failed with status code 500');
  });

  it('should fetch raw transaction status', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/rawtransaction/status`).reply(200, mockRawTransactionStatusData);

    const statusData = await oktoWallet.getRawTransactionStatus({} as Types.RawTransactionStatusQuery);
    expect(statusData).toEqual(mockRawTransactionStatusData.data);
  });

  it('should handle failed raw transaction status fetch', async () => {
    mockAxios.onGet(`${baseUrl}/api/v1/rawtransaction/status`).reply(500);

    await expect(oktoWallet.getRawTransactionStatus({} as Types.RawTransactionStatusQuery)).rejects.toThrow('Request failed with status code 500');
  });

  it('should transfer tokens with job status', async () => {
    mockAxios
      .onPost(`${baseUrl}/api/v1/transfer/tokens/execute`)
      .reply(200, mockTransferTokensData);
    mockAxios
      .onGet(`${baseUrl}/api/v1/orders?order_id=${mockTransferTokensData.data.orderId}`)
      .reply(200, mockOrderData);

    const transferData = await oktoWallet.transferTokensWithJobStatus({} as Types.TransferTokens);
    const order_ids = mockOrderData.data.jobs.map((x: any) => x.order_id);
    expect(order_ids).toContain(transferData.order_id);
  });


});
