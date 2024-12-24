export const mockAuthDetails = {
  authToken: 'auth-token',
  refreshToken: 'refresh-token',
  deviceToken: 'device-token',
};

export const mockApiResponse = (data: any) => ({
  status: 'success',
  data: data,
});

export const mockAuthenticateData = mockApiResponse({
  auth_token: mockAuthDetails.authToken,
  refresh_auth_token: mockAuthDetails.refreshToken,
  device_token: mockAuthDetails.deviceToken,
});

export const mockPortfolioData = mockApiResponse({
  total: 1,
  tokens: [
    {
      token_name: 'SOL_DEVNET',
      quantity: '1.0',
      amount_in_inr: '0',
      token_image: '',
      token_address: '',
      network_name: 'SOLANA_DEVNET',
    },
  ],
});

export const mockTokensData = mockApiResponse({
  tokens: [
    {
      token_name: 'APT',
      token_address: '0x1::aptos_coin::AptosCoin',
      network_name: 'APTOS',
    },
  ],
});

export const mockNetworkData = mockApiResponse({
  network: [
    {
      network_name: 'APTOS',
      chain_id: '1',
    },
    {
      network_name: 'APTOS_TESTNET',
      chain_id: '2',
    },
    {
      network_name: 'SOLANA',
      chain_id: '101',
    },
    {
      network_name: 'SOLANA_DEVNET',
      chain_id: '103',
    },
  ],
});

export const mockUserData = mockApiResponse({
  email: 'test@email.com',
  user_id: '121213e43@34234343#23232',
  created_at: '121213e43',
  freezed: false,
  freeze_reason: '',
});

export const mockWalletData = mockApiResponse({
  wallets: [
    {
      network_name: 'APTOS',
      address: '0xsdfsdfsdefsdfsdfsdfsdfsdfsdfsdfsdfqwerwedfsdfs',
      network_id: 'dd50ef5f-58f4-3133-8e25-9c2673a9122f',
      network_symbol: 'APT',
    },
  ],
});

export const mockOrderData = mockApiResponse({
  total: 1,
  jobs: [
    {
      order_id: 'e84e4119-6dbf-44cf-875b-ed23w42342342',
      order_type: 'DEFI_TO_EXT',
      network_name: 'SOLANA_DEVNET',
      status: 'SUCCESS',
      transaction_hash:
        '5jn3PVwApmxLJoGmRWTSWTWi5zs528xtFDkjhkjhkjKCQVyxRGERZGsL65htPaXgysW1j8JXpEGJftzsmiGQXt3gmR',
    },
  ],
});

export const mockTransferTokensData = mockApiResponse({
  orderId: 'e84e4119-6dbf-44cf-875b-ed23w42342342',
});

export const mockNftOrderData = mockApiResponse({
  count: 1,
  nfts: [
    {
      explorer_smart_contract_url:
        'https://explorer.aptoslabs.com/0x3834f649bc2ef249898199ffbdfd77abb39b8732c30c4d5c742227feb34e93ed/0x3834f649bc2ef249898199ffbdfd77abb39b8732c30c4d5c742227feb34e93ed?network=testnet',
      description: 'pro af',
      type: 'NFT',
      collection_id: '267e0396-1148-51e2-8554-708f40c64e73',
      collection_name: 'super avengers',
      nft_token_id:
        '0x3834f649bc2ef249898199ffbdfd77abb39b8732c30c4d5c742227feb34e93ed',
      token_uri: 'ipfs://QmVFPvu8aeJHXyNVxpfftVHaKjRsbtH6dXWscJ2TukM3xi',
      id: 'dd784ad9-68f8-49b9-87dc-13723e933eab',
      image: '',
      collection_address:
        '0x171e643e8e8dabc66b838b9055dbdf88647cf6601b164f5987f50a497bedfbe1',
      collection_image: 'super.avengers.net/vk',
      network_name: 'APTOS_TESTNET',
      network_id: 'd6fd4680-c28d-37b2-994e-b9d3d4026f91',
      nft_name: 'I m pro',
    },
  ],
});

export const mockNftTransferData = mockApiResponse({
  order_id: 'dd784ad9-68f8-49b9-87dc-13723e933eab',
});

export const mockRawTransactionData = mockApiResponse({
  jobId: 'd6ce7f0c-1a7d-441d-bb3e-4e431fae84c9',
});

export const mockRawTransactionStatusData = mockApiResponse({
  jobs: [
    {
      order_id: 'd6ce7f0c-1a7d-441d-bb3e-4e431fae84c9',
      network_name: 'SOLANA_DEVNET',
      status: 'SUCCESS',
      transaction_hash:
        '45qimRvrsVwRKx2CPxXHS3SCzDjm5gxNqbu6H2yP4fwnnXgKMhJT3NqXpzdxNrv53ftnv2JaHYnu98gXbuNedTnV',
    },
  ],
});

export const mockEmailOTPVerifyResponse = mockApiResponse({
  message: 'success',
  auth_token: 'new-auth-token',
  refresh_auth_token: 'new-refresh-token',
  device_token: 'new-device-token',
});
