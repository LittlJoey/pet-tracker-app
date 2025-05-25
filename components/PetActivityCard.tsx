import { Pet } from "@/app/(tabs)/pets";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { PetActivity } from "@/lib/dao/activitiesDao";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { ActivityErrorCard, EmptyStateCard } from "./ui/ErrorCard";
import { ActivityCardSkeleton } from "./ui/SkeletonCard";

// Using imported PetActivity interface from DAO
// Local interface for display-specific data
interface DisplayActivity {
  id: string;
  type: "walk" | "meal" | "medication" | "vet-visit" | "grooming" | "play";
  title: string;
  duration?: string;
  distance?: string;
  calories?: string;
  time: string;
  notes?: string;
  petName?: string; // For multi-pet view
}

interface PetActivityCardProps {
  pet?: Pet;
  activities: DisplayActivity[];
  totalWalks: number;
  totalDistance: string;
  isMultiPetView?: boolean;
  onViewMore?: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Helper function to convert database PetActivity to DisplayActivity
export const convertToDisplayActivity = (
  activity: PetActivity,
  petName?: string
): DisplayActivity => {
  const activityDate = new Date(activity.activity_date);
  const timeString = activityDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return {
    id: activity.id,
    type: activity.type,
    title: activity.title,
    duration: activity.duration ? `${activity.duration} mins` : undefined,
    distance: activity.distance
      ? `${activity.distance.toFixed(1)} km`
      : undefined,
    calories: activity.calories ? `${activity.calories} kcal` : undefined,
    time: timeString,
    notes: activity.description,
    petName: petName
  };
};

export function PetActivityCard({
  pet,
  activities,
  totalWalks,
  totalDistance,
  isMultiPetView = false,
  onViewMore,
  loading = false,
  error = null,
  onRetry
}: PetActivityCardProps) {
  // Show skeleton loading state
  if (loading) {
    return <ActivityCardSkeleton />;
  }

  // Show error state
  if (error) {
    return <ActivityErrorCard onRetry={onRetry} isMultiPet={isMultiPetView} />;
  }

  // Show empty state when no activities
  if (activities.length === 0) {
    return (
      <EmptyStateCard
        title={
          isMultiPetView
            ? "No activities yet"
            : `No activities for ${pet?.name || "your pet"}`
        }
        message={
          isMultiPetView
            ? "Start tracking your pets' activities like walks, meals, and vet visits to see them here."
            : "Start tracking activities like walks, meals, and vet visits to see them here."
        }
        icon="pawprint.fill"
        actionText="Track Activity"
        onAction={() => console.log("Navigate to add activity")}
      />
    );
  }

  const colorScheme = useColorScheme() ?? "light";

  const getActivityIcon = (type: DisplayActivity["type"]) => {
    switch (type) {
      case "walk":
        return "figure.walk";
      case "meal":
        return "fork.knife.circle.fill";
      case "medication":
        return "pills.circle.fill";
      case "vet-visit":
        return "cross.case.fill";
      case "grooming":
        return "scissors";
      case "play":
        return "gamecontroller.fill";
      default:
        return "pawprint.fill";
    }
  };

  const getActivityColor = (type: DisplayActivity["type"]) => {
    switch (type) {
      case "walk":
        return "#4CAF50";
      case "meal":
        return "#FF9800";
      case "medication":
        return "#F44336";
      case "vet-visit":
        return "#2196F3";
      case "grooming":
        return "#9C27B0";
      case "play":
        return "#FF5722";
      default:
        return Colors[colorScheme].primary;
    }
  };

  const formatDuration = (activity: DisplayActivity) => {
    const parts = [];
    if (activity.duration) parts.push(activity.duration);
    if (activity.distance) parts.push(activity.distance);
    if (activity.calories) parts.push(activity.calories);
    return parts.join(" • ");
  };

  const formatActivityTitle = (activity: DisplayActivity) => {
    if (isMultiPetView && activity.petName) {
      return `${activity.petName}'s ${activity.title}`;
    }
    return activity.title;
  };

  const recentActivities = activities.slice(0, 2);
  const moreActivitiesCount = Math.max(0, activities.length - 2);

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: Colors[colorScheme].background,
          shadowColor: colorScheme === "dark" ? "#000" : "#404852"
        }
      ]}
    >
      {/* Date Header */}
      <ThemedText style={styles.dateHeader} type="subtitle">
        Today
      </ThemedText>

      {/* Stats Section */}
      <View
        style={[
          styles.statsContainer,
          { borderBottomColor: Colors[colorScheme].border }
        ]}
      >
        <View style={styles.statItem}>
          <ThemedText
            style={[styles.statLabel, { color: Colors[colorScheme].icon }]}
          >
            Walks
          </ThemedText>
          <ThemedText style={styles.statValue} type="title">
            {totalWalks}
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText
            style={[styles.statLabel, { color: Colors[colorScheme].icon }]}
          >
            Distance (km)
          </ThemedText>
          <ThemedText style={styles.statValue} type="title">
            {totalDistance}
          </ThemedText>
        </View>
      </View>

      {/* Activities List */}
      {recentActivities.map((activity) => (
        <View
          key={activity.id}
          style={[
            styles.activityItem,
            { borderBottomColor: Colors[colorScheme].border }
          ]}
        >
          <View style={styles.activityContent}>
            <View style={styles.iconAndTitle}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: getActivityColor(activity.type) }
                ]}
              >
                <IconSymbol
                  name={getActivityIcon(activity.type)}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.activityInfo}>
                <ThemedText style={styles.activityTitle} type="defaultSemiBold">
                  {formatActivityTitle(activity)}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.activityDetails,
                    { color: Colors[colorScheme].icon }
                  ]}
                >
                  {activity.time}
                  {formatDuration(activity) && ` • ${formatDuration(activity)}`}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.chevronButton}>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* More Activities Button */}
      {moreActivitiesCount > 0 && (
        <TouchableOpacity style={styles.moreActivities} onPress={onViewMore}>
          <ThemedText style={styles.moreActivitiesText} type="defaultSemiBold">
            + {moreActivitiesCount} more{" "}
            {moreActivitiesCount === 1 ? "activity" : "activities"}
          </ThemedText>
          <IconSymbol
            name="chevron.right"
            size={16}
            color={Colors[colorScheme].icon}
          />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 20
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8
  },
  dateHeader: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: -0.5
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    gap: 85
  },
  statItem: {
    flex: 1,
    gap: 8
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 13
  },
  statValue: {
    fontSize: 28,
    fontWeight: "500",
    lineHeight: 28,
    letterSpacing: -0.3
  },
  activityItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1
  },
  activityContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  iconAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  activityInfo: {
    flex: 1,
    gap: 2
  },
  activityTitle: {
    fontSize: 14,
    lineHeight: 20
  },
  activityDetails: {
    fontSize: 13,
    lineHeight: 13,
    opacity: 0.5
  },
  chevronButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5
  },
  moreActivities: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4
  },
  moreActivitiesText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1
  }
});
