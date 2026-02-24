import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';

import Home from '../screens/Home';
import Roadmap from '../screens/Roadmap';
import Questionnaire from '../screens/Questionnaire';
import Profile from '../screens/Profile';
import DailyTasks from '../screens/DailyTasks';
import Resources from '../screens/Resources';
import Jobs from '../screens/Jobs';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

function TabIcon({ name, focused }) {
  const icons = {
    Home: '🏠',
    Roadmap: '🗺️',
    AI: '🤖',
    More: '📋',
    Profile: '👤',
  };
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icons[name] || '•'}</Text>
  );
}

function MoreStackScreen() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: true }}>
      <MoreStack.Screen name="MoreList" component={MoreScreen} options={{ title: 'More' }} />
      <MoreStack.Screen name="DailyTasks" component={DailyTasks} options={{ title: 'Daily Tasks' }} />
      <MoreStack.Screen name="ProgressTracker" component={ProgressTracker} options={{ title: 'Progress Tracker' }} />
      <MoreStack.Screen name="Resources" component={Resources} options={{ title: 'Resources' }} />
      <MoreStack.Screen name="Jobs" component={Jobs} options={{ title: 'Jobs & Internships' }} />
    </MoreStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: route.name === 'More' ? false : true,
        headerStyle: { backgroundColor: '#F6F6F6' },
        headerTitleStyle: { color: '#000', fontWeight: '700' },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5e5e5' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: 'EduRoute AI' }} />
      <Tab.Screen name="Roadmap" component={Roadmap} options={{ title: 'Roadmap' }} />
      <Tab.Screen name="AI" component={Questionnaire} options={{ title: 'AI Chat' }} />
      <Tab.Screen name="More" component={MoreStackScreen} options={{ title: 'More' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: { fontSize: 20 },
  tabIconFocused: { opacity: 1 },
});
