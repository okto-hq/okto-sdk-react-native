# okto-sdk-react-native

## Description

The `okto-sdk-react-native` is a React Native SDK for integrating Okto services into mobile applications. This SDK provides functionalities to interact with Okto's features and services within your React Native projects.

## Installation

Install the package in your React Native project:

```sh
npm install okto-sdk-react-native
```

Additionally, ensure that the peer dependencies are installed by running:
```sh
npm install @react-native-async-storage/async-storage axios react-native-webview
```

## Usage

To utilize the SDK within your application, follow these steps:

1. Wrap your application with the OktoProvider component, providing the necessary configuration parameters:

```jsx
import { OktoProvider, BuildType } from 'okto-sdk-react-native';

<OktoProvider apiKey={OKTO_CLIENT_API} buildType={BuildType.SANDBOX}>
    <App />
</OktoProvider>
```

2. Access SDK functionalities within your components:
```jsx
import {
  useOkto,
  type OktoContextType,
} from 'okto-sdk-react-native';


export default function App(){
   const {
    authenticate,
  } = useOkto() as OktoContextType;
   return (
    <Button
        title="authenticate"
        onPress={() => {
            authenticate(idToken!, handleAuthenticate);
        }}
        />
    )
}

```

## Running example app
To run the example application on Android or iOS devices, execute the respective commands:


```
yarn example android
yarn example ios
```


## Documentation

For more detailed usage instructions and API documentation, please visit .
[Okto SDK Documentation](https://docs.okto.tech/okto_sdk/overview)

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/okto-hq/okto-sdk-react-native)

### Building the Okto SDK
To build the Okto SDK, run the following command:

```
yarn prepare
```

