export enum BuildType {
  STAGING = 'STAGING',
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION',
}

export enum OrderStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum AuthType {
  PHONE = 'Phone',
  EMAIL = 'Email',
  GAUTH = 'GAuth',
}

export interface BrandData {
  title: string;
  subtitle: string;
  iconUrl: string;
}

/**
 * Context type providing access to Okto SDK functionality
 * @interface OktoContextType
 */
export interface OktoContextType {
  /** Indicates whether the SDK has completed initialization */
  isLoggedIn: boolean;

  /** Indicates whether a user is currently authenticated */
  isReady: boolean;

  /** Shows the widget sheet UI */
  showWidgetSheet: () => void;

  /** Closes the bottom sheet UI */
  closeBottomSheet: () => void;

  /**
   * Authenticates a user with Google OAuth
   * @param {string} idToken - Google ID token
   * @param {(result: boolean, error: Error | null) => void} callback - Result callback
   */
  authenticate: (
    idToken: string,
    callback: (result: boolean, error: Error | null) => void
  ) => void;

  /**
   * Authenticates a user with a user ID and JWT token
   * @param {string} userId - User identifier
   * @param {string} jwtToken - JWT authentication token
   * @param {(result: boolean, error: Error | null) => void} callback - Result callback
   */
  authenticateWithUserId: (
    userId: string,
    jwtToken: string,
    callback: (result: boolean, error: Error | null) => void
  ) => void;

  /** Logs out the current user */
  logOut: () => void;

  /**
   * Gets user's portfolio data
   * @returns {Promise<PortfolioData>} Portfolio information
   */
  getPortfolio(): Promise<PortfolioData>;

  /**
   * Gets list of supported networks
   * @returns {Promise<NetworkData>} Supported networks information
   */
  getSupportedNetworks: () => Promise<NetworkData>;

  /**
   * Gets list of supported tokens
   * @returns {Promise<TokensData>} Supported tokens information
   */
  getSupportedTokens: () => Promise<TokensData>;

  /**
   * Gets current user details
   * @returns {Promise<User>} User information
   */
  getUserDetails: () => Promise<User>;

  /**
   * Gets user's wallets
   * @returns {Promise<WalletData>} Wallet information
   */
  getWallets: () => Promise<WalletData>;

  /**
   * Gets order history based on query parameters
   * @param {Partial<OrderQuery>} query - Query parameters for filtering orders
   * @returns {Promise<OrderData>} Order history data
   */
  orderHistory: (query: Partial<OrderQuery>) => Promise<OrderData>;

  /**
   * Gets NFT order details
   * @param {Partial<NftOrderDetailsQuery>} query - Query parameters
   * @returns {Promise<NftOrderDetailsData>} NFT order details
   */
  getNftOrderDetails(
    query: Partial<NftOrderDetailsQuery>
  ): Promise<NftOrderDetailsData>;

  /**
   * Gets raw transaction status
   * @param {RawTransactionStatusQuery} query - Query parameters
   * @returns {Promise<RawTransactionStatusData>} Transaction status data
   */
  getRawTransactionStatus(
    query: RawTransactionStatusQuery
  ): Promise<RawTransactionStatusData>;

  /**
   * Creates a new wallet
   * @returns {Promise<WalletData>} New wallet information
   */
  createWallet: () => Promise<WalletData>;

  /**
   * Transfers tokens
   * @param {TransferTokens} data - Transfer details
   * @returns {Promise<TransferTokensData>} Transfer response
   */
  transferTokens: (data: TransferTokens) => Promise<TransferTokensData>;

  /**
   * Transfers tokens with job status tracking
   * @param {TransferTokens} data - Transfer details
   * @returns {Promise<Order>} Order details with status
   */
  transferTokensWithJobStatus: (data: TransferTokens) => Promise<Order>;

  /**
   * Transfers NFT
   * @param {TransferNft} data - NFT transfer details
   * @returns {Promise<TransferNftData>} Transfer response
   */
  transferNft: (data: TransferNft) => Promise<TransferNftData>;

  /**
   * Transfers NFT with job status tracking
   * @param {TransferNft} data - NFT transfer details
   * @returns {Promise<NftOrderDetails>} Order details
   */
  transferNftWithJobStatus(data: TransferNft): Promise<NftOrderDetails>;

  /**
   * Executes a raw transaction
   * @param {ExecuteRawTransaction} data - Transaction data
   * @returns {Promise<ExecuteRawTransactionData>} Transaction response
   */
  executeRawTransaction: (
    data: ExecuteRawTransaction
  ) => Promise<ExecuteRawTransactionData>;

  /**
   * Executes a raw transaction with job status tracking
   * @param {ExecuteRawTransaction} data - Transaction data
   * @returns {Promise<RawTransactionStatus>} Transaction status
   */
  executeRawTransactionWithJobStatus(
    data: ExecuteRawTransaction
  ): Promise<RawTransactionStatus>;

  /**
   * Gets the current UI theme
   * @returns {Theme} Current theme configuration
   */
  getTheme: () => Theme;

  /**
   * Updates the UI theme
   * @param {Partial<Theme>} theme - Theme properties to update
   */
  setTheme: (theme: Partial<Theme>) => void;

  /**
   * Sends OTP to email
   * @param {string} email - Email address
   * @returns {Promise<SendOTPResponse>} OTP response
   */
  sendEmailOTP: (email: string) => Promise<SendOTPResponse>;

  /**
   * Verifies email OTP
   * @param {string} email - Email address
   * @param {string} otp - One-time password
   * @param {string} token - Verification token
   * @returns {Promise<boolean>} Verification result
   */
  verifyEmailOTP: (
    email: string,
    otp: string,
    token: string
  ) => Promise<boolean>;

  /**
   * Sends OTP to phone number
   * @param {string} phoneNumber - Phone number
   * @param {string} countryShortName - Country code
   * @returns {Promise<SendOTPResponse>} OTP response
   */
  sendPhoneOTP: (
    phoneNumber: string,
    countryShortName: string
  ) => Promise<SendOTPResponse>;

  /**
   * Verifies phone OTP
   * @param {string} phoneNumber - Phone number
   * @param {string} countryShortName - Country code
   * @param {string} otp - One-time password
   * @param {string} token - Verification token
   * @returns {Promise<boolean>} Verification result
   */
  verifyPhoneOTP: (
    phoneNumber: string,
    countryShortName: string,
    otp: string,
    token: string
  ) => Promise<boolean>;

  /**
   * Updates authentication details
   * @param {AuthDetails | null} authDetails - New auth details or null to clear
   * @returns {Promise<void>}
   */
  updateAuthDetails: (authDetails: AuthDetails | null) => Promise<void>;

  /**
   * Shows the onboarding widget
   * @param {AuthType} [primaryAuth] - Primary authentication method
   * @param {string} [title] - Widget title
   * @param {string} [subtitle] - Widget subtitle
   * @param {string} [iconUrl] - URL for widget icon
   */
  showOnboardingWidget: (
    primaryAuth?: AuthType,
    title?: string,
    subtitle?: string,
    iconUrl?: string
  ) => void;

  /** Closes the onboarding widget */
  closeOnboardingWidget: () => void;

  /**
   * Reads data from a smart contract
   * @param {string} network_name - Network name
   * @param {any} data - Contract interaction data
   * @returns {Promise<any>} Contract response data
   */
  readContractData: (network_name: string, data: any) => Promise<any>;
}

export interface ApiResponse<T> {
  data: T;
  status: string;
}

export type Callback<T> = (result: T | null, error: Error | null) => void;

export interface AuthDetails {
  authToken: string;
  refreshToken: string;
  deviceToken: string;
}

export interface Network {
  network_name: string;
  chain_id: string;
}

export interface NetworkData {
  network: Network[];
}

export interface NftOrderDetailsQuery {
  page: number;
  size: number;
  order_id: string;
}

export interface NftOrderDetails {
  explorer_smart_contract_url: string;
  description: string;
  type: string;
  collection_id: string;
  collection_name: string;
  nft_token_id: string;
  token_uri: string;
  id: string;
  image: string;
  collection_address: string;
  collection_image: string;
  network_name: string;
  network_id: string;
  nft_name: string;
}

export interface NftOrderDetailsData {
  count: number;
  nfts: NftOrderDetails[];
}

export interface OrderQuery {
  offset: number;
  limit: number;
  order_id: string;
  order_state: string;
}

export interface Order {
  order_id: string;
  network_name: string;
  order_type: string;
  status: string;
  transaction_hash: string;
}

export interface OrderData {
  total: number;
  jobs: Order[];
}

export interface Portfolio {
  token_name: string;
  token_image: string;
  token_address: string;
  network_name: string;
  quantity: string;
  amount_in_inr: string;
}

export interface PortfolioData {
  tokens: Portfolio[];
  total: number;
}

export interface Token {
  token_name: string;
  token_address: string;
  network_name: string;
}

export interface TokensData {
  tokens: Token[];
}

export interface User {
  email: string;
  user_id: string;
  created_at: string;
  freezed: string;
  freeze_reason: string;
}

export interface Wallet {
  network_name: string;
  address: string;
  success: boolean;
}

export interface WalletData {
  wallets: Wallet[];
}

export interface RawTransactionStatusQuery {
  order_id: string;
}

export interface RawTransactionStatus {
  order_id: string;
  network_name: string;
  status: string;
  transaction_hash: string;
}

export interface RawTransactionStatusData {
  total: number;
  jobs: RawTransactionStatus[];
}

export interface TransferTokens {
  network_name: string;
  token_address: string;
  quantity: string;
  recipient_address: string;
}

export interface TransferTokensData {
  orderId: string;
}

export interface TransferNft {
  operation_type: string;
  network_name: string;
  collection_address: string;
  collection_name: string;
  quantity: string;
  recipient_address: string;
  nft_address: string;
}

export interface TransferNftData {
  order_id: string;
}

export interface ExecuteRawTransaction {
  network_name: string;
  transaction: object;
}

export interface ExecuteRawTransactionData {
  jobId: string;
}

export interface Theme {
  textPrimaryColor: String;
  textSecondaryColor: String;
  textTertiaryColor: String;
  accent1Color: String;
  accent2Color: String;
  strokeBorderColor: String;
  strokeDividerColor: String;
  surfaceColor: String;
  backgroundColor: String;
}

export interface SendOTPResponse {
  status: string;
  message: string;
  code: number;
  token: string;
  trace_id: string;
}

export interface VerifyEmailOTPRequest {
  email: string;
  otp: string;
  token: string;
}

export interface OTPAuthResponse {
  auth_token: string;
  message: string;
  refresh_auth_token: string;
  device_token: string;
  trace_id: string;
}
