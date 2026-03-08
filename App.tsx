import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./app/screens/HomeScreen";
import VoiceControlScreen from "./app/screens/VoiceControlScreen";
import ARCameraScreen from "./app/screens/ARCameraScreen";
import NavigationScreen from "./app/screens/NavigationScreen";
import SettingsScreen from "./app/screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="VoiceControl" component={VoiceControlScreen} />
        <Stack.Screen name="ARCamera" component={ARCameraScreen} />
        <Stack.Screen name="Navigation" component={NavigationScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
