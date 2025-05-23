import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

export type Activity = {
  id: string;
  type: "walk" | "vet" | "medication" | "weight";
  date: Date;
  title: string;
  details?: string;
  value?: number;
  unit?: string;
};

type RecentActivityCardProps = {
  activities: Activity[];
  onPress?: () => void;
};

export function RecentActivityCard({
  activities,
  onPress
}: RecentActivityCardProps) {
  if (!activities || activities.length === 0) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText style={styles.emptyText}>No recent activities</ThemedText>
      </ThemedView>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "walk":
        return "figure.walk";
      case "vet":
        return "stethoscope";
      case "medication":
        return "pill";
      case "weight":
        return "scalemass";
      default:
        return "calendar";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            Recent Activities
          </ThemedText>
        </View>

        <View style={styles.activitiesList}>
          {activities.slice(0, 3).map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => console.log(`Activity pressed: ${activity.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.activityIconContainer}>
                <IconSymbol
                  name={getActivityIcon(activity.type)}
                  size={16}
                  color="#4CAF50"
                />
              </View>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityTitle}>
                  {activity.title}
                </ThemedText>
                <ThemedText style={styles.activityDate}>
                  {formatDate(activity.date)}
                </ThemedText>
              </View>
              {activity.value !== undefined && (
                <ThemedText style={styles.activityValue}>
                  {activity.value} {activity.unit}
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {activities.length > 3 && (
          <TouchableOpacity style={styles.viewMoreButton} onPress={onPress}>
            <ThemedText style={styles.viewMoreText}>
              View all activities
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 18
  },
  activitiesList: {
    gap: 12
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center"
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  activityContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500"
  },
  activityDate: {
    fontSize: 12,
    opacity: 0.7
  },
  activityValue: {
    fontSize: 14,
    fontWeight: "bold"
  },
  viewMoreButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE"
  },
  viewMoreText: {
    fontSize: 14,
    color: "#4CAF50"
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
    padding: 16
  }
});
