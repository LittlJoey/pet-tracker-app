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

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: any;
  style?: object;
}

export function ErrorCard({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try Again",
  icon = "exclamationmark.triangle.fill",
  style
}: ErrorCardProps) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={styles.content}>
        <IconSymbol
          name={icon}
          size={48}
          color={Colors[colorScheme].error || "#FF3B30"}
          style={styles.icon}
        />
        <ThemedText style={styles.title} type="subtitle">
          {title}
        </ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <IconSymbol
              name="arrow.clockwise"
              size={16}
              color={Colors[colorScheme].background}
              style={styles.retryIcon}
            />
            <ThemedText style={styles.retryText}>{retryText}</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

export function ActivityErrorCard({
  onRetry,
  isMultiPet = false
}: {
  onRetry?: () => void;
  isMultiPet?: boolean;
}) {
  return (
    <ErrorCard
      title="Unable to load activities"
      message={
        isMultiPet
          ? "We couldn't load your pets' activities. Please check your connection and try again."
          : "We couldn't load your pet's activities. Please check your connection and try again."
      }
      onRetry={onRetry}
      icon="wifi.exclamationmark"
    />
  );
}

export function EmptyStateCard({
  title,
  message,
  icon = "tray.fill",
  actionText,
  onAction
}: {
  title: string;
  message: string;
  icon?: any;
  actionText?: string;
  onAction?: () => void;
}) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <IconSymbol
          name={icon}
          size={48}
          color={Colors[colorScheme].tabIconDefault}
          style={styles.icon}
        />
        <ThemedText style={styles.title} type="subtitle">
          {title}
        </ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        {onAction && actionText && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <ThemedText style={styles.actionText}>{actionText}</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
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
    minHeight: 200
  },
  content: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  icon: {
    marginBottom: 16
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600"
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  retryIcon: {
    marginRight: 4
  },
  retryText: {
    color: "white",
    fontWeight: "600"
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF"
  },
  actionText: {
    color: "#007AFF",
    fontWeight: "600"
  }
});
