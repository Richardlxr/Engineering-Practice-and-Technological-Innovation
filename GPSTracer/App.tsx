import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrackingProvider } from './src/context/TrackingContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { RecordsScreen } from './src/screens/RecordsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <TrackingProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#f4f7f3' },
              headerTitleStyle: { color: '#17342a', fontWeight: '800' },
              tabBarActiveTintColor: '#1f5f4a',
              tabBarInactiveTintColor: '#687970',
              tabBarStyle: { height: 62, paddingTop: 6 },
            }}
          >
            <Tab.Screen
              name="地图"
              component={HomeScreen}
              options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>◎</Text> }}
            />
            <Tab.Screen
              name="记录"
              component={RecordsScreen}
              options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>☷</Text> }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </TrackingProvider>
    </SafeAreaProvider>
  );
}
