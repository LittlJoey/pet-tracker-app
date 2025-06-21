import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Stack, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, useColorScheme } from "react-native";

export default function ActivitiesLayout() {
  const colorScheme = useColorScheme() ?? "light";

  const BackButton = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4
      }}
    >
      <IconSymbol name="chevron.left" size={20} color="#4CAF50" />
      <Text
        style={{
          color: "#4CAF50",
          fontSize: 17,
          fontWeight: "400",
          marginLeft: 4
        }}
      >
        Back
      </Text>
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false, // Hide default back button
        headerTintColor: "#4CAF50",
        headerStyle: {
          backgroundColor: Colors[colorScheme].background
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
          color: Colors[colorScheme].text
        },
        headerLeft: () => <BackButton />
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Activities"
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Activity Details"
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Activity",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8
              }}
            >
              <Text
                style={{
                  color: "#4CAF50",
                  fontSize: 17,
                  fontWeight: "500"
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          )
        }}
      />
    </Stack>
  );
}
