import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Shield, Map as MapIcon, User, Swords, LayoutDashboard, Activity, Trophy } from 'lucide-react-native';

// Placeholder Screens
import { DashboardScreen } from '../features/home/DashboardScreen';
import { WorkoutScreen } from '../features/fitness/WorkoutScreen';
import { BattleScreen } from '../features/battle/BattleScreen';
import { MapScreen } from '../features/story/MapScreen';
import { CharacterScreen } from '../features/story/CharacterScreen';
import { SocialScreen } from '../features/home/SocialScreen';
import { QuestVisionScreen } from '../features/fitness/QuestVisionScreen';
import { SettingsScreen } from '../features/story/SettingsScreen';
import { SkillHubScreen } from '../features/skills/SkillHubScreen';
import { ShadowArmyScreen } from '../features/skills/ShadowArmyScreen';
import { SurvivalQuestScreen } from '../features/fitness/SurvivalQuestScreen';
import { OnboardingScreen } from '../features/auth/OnboardingScreen';
import { LoginScreen } from '../features/auth/LoginScreen';

import { NotificationSettingsScreen } from '../features/settings/NotificationSettingsScreen';
import { BuzzerQuestScreen } from '../features/fitness/BuzzerQuestScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1E2130',
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 8,
        paddingBottom: 12,
        height: 70,
      },
      tabBarActiveTintColor: '#00F0FF',
      tabBarInactiveTintColor: '#A0A0B0',
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{
        tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Training" 
      component={WorkoutScreen}
      options={{
        tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Map" 
      component={MapScreen}
      options={{
        tabBarIcon: ({ color }) => <MapIcon size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Arena" 
      component={BattleScreen}
      options={{
        tabBarIcon: ({ color }) => <Swords size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Social" 
      component={SocialScreen}
      options={{
        tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Character" 
      component={CharacterScreen} 
      options={{
        tabBarIcon: ({ color }) => <User size={24} color={color} />,
      }}
    />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
        {/* Auth Screens */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Main Application */}
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="QuestVision" component={QuestVisionScreen} />
        <Stack.Screen name="AdvancedSettings" component={SettingsScreen} />
        <Stack.Screen name="SkillHub" component={SkillHubScreen} />
        <Stack.Screen name="ShadowArmy" component={ShadowArmyScreen} />
        <Stack.Screen name="SurvivalQuest" component={SurvivalQuestScreen} />
        
        {/* Settings & Special Quests */}
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="BuzzerQuest" component={BuzzerQuestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
