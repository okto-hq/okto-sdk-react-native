import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { OktoProvider, useOkto } from '../OktoProvider';
import { BuildType } from '../types';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { baseUrls } from '../constants';
import { mockAuthenticateData } from '../../__mocks__/mockResponses';
import { refFunctions } from '../../__mocks__/react-native-webview';

// Mock axios
const mockAxios = new MockAdapter(axios);

// Test component that uses the Okto context
const TestComponent = () => {
  const okto = useOkto();
  return (
    <View>
      <Text testID="login-status">
        {okto.isLoggedIn ? 'logged-in' : 'logged-out'}
      </Text>
      <Pressable onPress={() => okto.showWidgetSheet()}>
        <Text>Show Widget</Text>
      </Pressable>
    </View>
  );
};

// Add jest.mock at the top of the file after imports
jest.mock('react-native-webview');

describe('OktoProvider', () => {
  const apiKey = 'test-api-key';
  const buildType = BuildType.SANDBOX;
  const baseUrl = baseUrls[buildType];

  beforeEach(() => {
    mockAxios.reset();
    // Reset the mock functions before each test
    refFunctions.reload.mockClear();
  });

  it('should provide initial context values', async () => {
    render(
      <OktoProvider apiKey={apiKey} buildType={buildType}>
        <TestComponent />
      </OktoProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

  });

  it('should handle authentication success', async () => {
    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, {
      status: 'success',
      data: mockAuthenticateData,
    });

    // Create a component that will call authenticate
    const AuthTestComponent = () => {
      const {isReady, authenticate} = useOkto();

      React.useEffect(() => {
        if (!isReady) {return;}

        authenticate('test-token', (result, error) => {
          expect(error).toBeNull();
          expect(result).toBeDefined();
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isReady]);

      return <Text>Auth Test</Text>;
    };

    render(
        <OktoProvider apiKey={apiKey} buildType={buildType}>
            <AuthTestComponent />
        </OktoProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it('should handle authentication failure', async () => {
    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(401);

    const AuthTestComponent = () => {
      const {isReady, authenticate} = useOkto();

      React.useEffect(() => {
        if (!isReady) {return;}

        authenticate('test-token', (result, error) => {
          expect(error).toBeDefined();
          expect(result).toBeNull();
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isReady]);

      return <Text>Auth Test</Text>;
    };

    render(
      <OktoProvider apiKey={apiKey} buildType={buildType}>
        <AuthTestComponent />
      </OktoProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

  });

//   it('should handle logout', async () => {
//     const { getByTestId } = render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <TestComponent />
//       </OktoProvider>
//     );

//     const okto = useOkto();

//     // First login
//     mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, {
//       status: 'success',
//       data: mockAuthenticateData,
//     });

//     await act(async () => {
//       await new Promise((resolve) => {
//         okto.authenticate('test-token', resolve);
//       });
//     });

//     // Then logout
//     await act(async () => {
//       await okto.logOut();
//     });

//   });

//   it('should handle portfolio data fetch', async () => {
//     mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, {
//       status: 'success',
//       data: mockAuthenticateData,
//     });

//     mockAxios.onGet(`${baseUrl}/api/v1/portfolio`).reply(200, {
//       status: 'success',
//       data: mockPortfolioData,
//     });

//     render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <TestComponent />
//       </OktoProvider>
//     );

//     const okto = useOkto();

//     // Login first
//     await act(async () => {
//       await new Promise((resolve) => {
//         okto.authenticate('test-token', resolve);
//       });
//     });

//     // Then fetch portfolio
//     await act(async () => {
//       const portfolio = await okto.getPortfolio();
//       expect(portfolio).toEqual(mockPortfolioData.data);
//     });
//   });

//   it('should handle theme updates', async () => {
//     render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <TestComponent />
//       </OktoProvider>
//     );

//     const okto = useOkto();
//     const newTheme = { textPrimaryColor: '#000000' };

//     act(() => {
//       okto.setTheme(newTheme);
//     });

//     expect(okto.getTheme().textPrimaryColor).toBe('#000000');
//   });

//   it('should handle email OTP verification', async () => {
//     mockAxios.onPost(`${baseUrl}/api/v1/authenticate/email/verify`).reply(200, {
//       message: 'success',
//       auth_token: 'new-auth-token',
//       refresh_auth_token: 'new-refresh-token',
//       device_token: 'new-device-token',
//     });

//     const { getByTestId } = render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <TestComponent />
//       </OktoProvider>
//     );

//     const okto = useOkto();

//     await act(async () => {
//       const result = await okto.verifyEmailOTP('test@email.com', '123456', 'token');
//       expect(result).toBe(true);
//     });

//   });

//   it('should handle widget sheet display', () => {
//     const { getByText } = render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <TestComponent />
//       </OktoProvider>
//     );

//     const showWidgetButton = getByText('Show Widget');
//     fireEvent.press(showWidgetButton);
//     // Add assertions for widget sheet display if possible
//   });

//   it('should handle WebView reload', async () => {
//     const { getByTestId } = render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <TestComponent />
//       </OktoProvider>
//     );

//     // Access the mocked reload function
//     expect(refFunctions.reload).not.toHaveBeenCalled();

//     // If your OktoProvider has a method that triggers WebView reload
//     // you can test it like this:
//     const okto = useOkto();
//     await act(async () => {
//       okto.reloadWebView(); // Assuming this method exists
//     });

//     expect(refFunctions.reload).toHaveBeenCalled();
//   });
});
