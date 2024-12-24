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

  it('should handle logout', async () => {
    render(
      <OktoProvider apiKey={apiKey} buildType={buildType}>
        <TestComponent />
      </OktoProvider>
    );

    // Create a component that will test logout functionality
    const LogoutTestComponent = () => {
      const { isReady,isLoggedIn, authenticate, logOut } = useOkto();

      React.useEffect(() => {
        if (!isReady) {return;}

        const testLogout = async () => {
          // First authenticate
          await new Promise((resolve) => {
            authenticate('test-token', resolve);
          });

          // Then logout
          await logOut();

          // Verify logout status
          expect(isLoggedIn).toBe(false);
        };

        testLogout();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isReady]);

      return <Text>Logout Test</Text>;
    };

    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, {
      status: 'success',
      data: mockAuthenticateData,
    });

    render(
      <OktoProvider apiKey={apiKey} buildType={buildType}>
        <LogoutTestComponent />
      </OktoProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it('should handle portfolio data fetch', async () => {
    const mockPortfolioData = {
      data: {
        portfolioItems: [],
        totalValue: 1000,
      },
    };

    mockAxios.onPost(`${baseUrl}/api/v2/authenticate`).reply(200, {
      status: 'success',
      data: mockAuthenticateData,
    });

    mockAxios.onGet(`${baseUrl}/api/v1/portfolio`).reply(200, {
      status: 'success',
      data: mockPortfolioData,
    });

    // Create a component that will test portfolio fetch
    const PortfolioTestComponent = () => {
      const { isReady, isLoggedIn, authenticate, getPortfolio } = useOkto();

      React.useEffect(() => {
        if (!isReady) {return;}
        if (!isLoggedIn) {
            authenticate('test-token', () => {});
            return;
        }

        const testPortfolio = async () => {
          // Then fetch portfolio
          const portfolio = await getPortfolio();
          expect(portfolio).toEqual(mockPortfolioData.data);
        };

        testPortfolio();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isReady, isLoggedIn]);

      return <Text>Portfolio Test</Text>;
    };

    render(
      <OktoProvider apiKey={apiKey} buildType={buildType}>
        <PortfolioTestComponent />
      </OktoProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it('should handle theme updates', async () => {
    // Create a component that will test theme updates
    const ThemeTestComponent = () => {
      const { isReady, setTheme } = useOkto();

      React.useEffect(() => {
        if (!isReady) {return;}

        const testTheme = async () => {
            const newTheme = { textPrimaryColor: '#00000000' };
            setTheme(newTheme);
        };

        testTheme();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isReady]);

      return <Text>Theme Test</Text>;
    };

    render(
      <OktoProvider apiKey={apiKey} buildType={buildType}>
        <ThemeTestComponent />
      </OktoProvider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

//   it('should handle email OTP verification', async () => {
//     mockAxios.onPost(`${baseUrl}/api/v1/authenticate/email/verify`).reply(200, {
//       message: 'success',
//       auth_token: 'new-auth-token',
//       refresh_auth_token: 'new-refresh-token',
//       device_token: 'new-device-token',
//     });

//     // Create a component that will test OTP verification
//     const OTPTestComponent = () => {
//       const { isReady, verifyEmailOTP } = useOkto();

//       React.useEffect(() => {
//         if (!isReady) {return;}

//         const testOTP = async () => {
//           const result = await verifyEmailOTP('test@email.com', '123456', 'token');
//           expect(result).toBe(true);
//         };

//         testOTP();
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//       }, [isReady]);

//       return <Text>OTP Test</Text>;
//     };

//     render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <OTPTestComponent />
//       </OktoProvider>
//     );

//     await act(async () => {
//       await new Promise(resolve => setTimeout(resolve, 0));
//     });
//   });

//   it('should handle widget sheet display', async () => {
//     const { getByText } = render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <TestComponent />
//       </OktoProvider>
//     );

//     await act(async () => {
//       const showWidgetButton = getByText('Show Widget');
//       showWidgetButton.props.onPress();
//     });
//   });

//   it('should handle WebView reload', async () => {
//     // Create a component that will test WebView reload
//     const ReloadTestComponent = () => {
//       const { isReady, reloadWebView } = useOkto();

//       React.useEffect(() => {
//         if (!isReady) {return;}

//         reloadWebView();
//         expect(refFunctions.reload).toHaveBeenCalled();
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//       }, [isReady]);

//       return <Text>Reload Test</Text>;
//     };

//     render(
//       <OktoProvider apiKey={apiKey} buildType={buildType}>
//         <ReloadTestComponent />
//       </OktoProvider>
//     );

//     await act(async () => {
//       await new Promise(resolve => setTimeout(resolve, 0));
//     });
//   });
});
