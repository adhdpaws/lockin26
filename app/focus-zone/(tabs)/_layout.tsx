import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function WarRoomTabsLayout() {
    return (
        <MaterialTopTabs
            id="war-room-tabs"
            screenOptions={{
                tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
                tabBarStyle: { backgroundColor: 'white', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
                tabBarIndicatorStyle: { backgroundColor: 'black', height: 3 },
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: '#9CA3AF',
            }}
        >
            <MaterialTopTabs.Screen name="index" options={{ title: 'QUICK ACTIONS' }} />
            <MaterialTopTabs.Screen name="campaign" options={{ title: 'FULL ROADMAP' }} />
            <MaterialTopTabs.Screen name="manual" options={{ title: 'MANUAL' }} />
        </MaterialTopTabs>
    );
}
