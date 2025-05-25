import { Colors } from "@/constants/Colors";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { IconSymbol } from "./IconSymbol";

interface NetworkErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  style?: object;
}

export function NetworkErrorCard({
  title = "Connection Problem",
  message = "Unable to connect to the server. Please check your internet connection and try again.",
  onRetry,
  retryText = "Retry Connection",
  style
}: NetworkErrorCardProps) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol
            name="wifi.exclamationmark"
            size={48}
            color={Colors[colorScheme].error || "#FF3B30"}
            style={styles.icon}
          />
        </View>

        <ThemedText style={styles.title} type="subtitle">
          {title}
        </ThemedText>

        <ThemedText style={styles.message}>{message}</ThemedText>

        <View style={styles.troubleshootingContainer}>
          <ThemedText style={styles.troubleshootingTitle}>
            Troubleshooting Steps:
          </ThemedText>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <ThemedText style={styles.stepNumber}>1.</ThemedText>
              <ThemedText style={styles.stepText}>
                Check your internet connection
              </ThemedText>
            </View>
            <View style={styles.step}>
              <ThemedText style={styles.stepNumber}>2.</ThemedText>
              <ThemedText style={styles.stepText}>
                Try switching between Wi-Fi and mobile data
              </ThemedText>
            </View>
            <View style={styles.step}>
              <ThemedText style={styles.stepNumber}>3.</ThemedText>
              <ThemedText style={styles.stepText}>
                Restart the app if the problem persists
              </ThemedText>
            </View>
          </View>
        </View>

        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <IconSymbol
              name="arrow.clockwise"
              size={16}
              color="white"
              style={styles.retryIcon}
            />
            <ThemedText style={styles.retryText}>{retryText}</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

export function AuthNetworkErrorCard({ onRetry }: { onRetry?: () => void }) {
  return (
    <NetworkErrorCard
      title="Authentication Connection Error"
      message="Unable to connect to authentication servers. This might be a temporary network issue."
      onRetry={onRetry}
      retryText="Try Again"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 300
  },
  content: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: "#FFF5F5"
  },
  icon: {
    alignSelf: "center"
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
    fontSize: 14
  },
  troubleshootingContainer: {
    width: "100%",
    marginBottom: 24
  },
  troubleshootingTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.light.text
  },
  stepsList: {
    gap: 8
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.tint,
    minWidth: 16
  },
  stepText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    flex: 1,
    lineHeight: 16
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    minWidth: 140
  },
  retryIcon: {
    marginRight: 4
  },
  retryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16
  }
});
