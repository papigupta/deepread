import { registerRootComponent } from 'expo';
import React from 'react';
import { TamaguiProvider } from './components/ui/TamaguiProvider';
import 'react-native-url-polyfill/auto';
import EnhancedApp from './EnhancedApp';

// Create root component with TamaguiProvider
const Root = () => (
  <TamaguiProvider>
    <EnhancedApp />
  </TamaguiProvider>
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
