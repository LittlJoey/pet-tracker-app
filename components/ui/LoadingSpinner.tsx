import { Colors } from "@/constants/Colors";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View
} from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large" | number;
  color?: string;
  style?: object;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = "large",
  color,
  style,
  overlay = false
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const defaultColor = color || Colors[colorScheme].tint;

  const Component = (
    <ActivityIndicator
      size={size}
      color={defaultColor}
      style={[styles.spinner, style]}
    />
  );

  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>{Component}</View>
      </View>
    );
  }

  return Component;
}

const styles = StyleSheet.create({
  spinner: {
    alignSelf: "center"
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  overlayContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
});
