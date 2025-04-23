import { registerRootComponent } from 'expo';
import React from 'react';
import { TamaguiProvider } from './components/ui/TamaguiProvider';
import 'react-native-url-polyfill/auto';
import EnhancedApp from './EnhancedApp';
import ErrorBoundary from './components/ErrorBoundary';

// Create root component with TamaguiProvider
const Root = () => (
  <ErrorBoundary>
    <TamaguiProvider>
      <EnhancedApp />
    </TamaguiProvider>
  </ErrorBoundary>
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
