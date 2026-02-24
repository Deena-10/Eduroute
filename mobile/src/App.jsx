import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F6F6" />
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
