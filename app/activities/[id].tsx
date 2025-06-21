import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { PetActivity } from "@/lib/dao/activitiesDao";
import { useAppDispatch, useAppSelector } from "@/store";
import { deleteActivity } from "@/store/activitiesSlice";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { activities, loading } = useAppSelector((state) => state.activities);
  const { pets } = useAppSelector((state) => state.pets);
  console.log("activities", activities);
  const [activity, setActivity] = useState<PetActivity | null>(null);

  useEffect(() => {
    // Find the activity in the current activities state
    const foundActivity = activities.find((a) => a.id === id);
    setActivity(foundActivity || null);
  }, [id, activities]);

  const handleEditActivity = () => {
    if (activity) {
      router.push({
        pathname: "/activities/add",
        params: {
          editId: activity.id,
          editMode: "true"
        }
      });
    }
  };

  const handleDeleteActivity = () => {
    if (!activity) return;

    Alert.alert(
      "Delete Activity",
      `Are you sure you want to delete "${activity.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteActivity(activity.id)).unwrap();

              Alert.alert(
                "Activity Deleted",
                "The activity has been successfully deleted.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back()
                  }
                ]
              );
            } catch (error) {
              console.error("Failed to delete activity:", error);
              Alert.alert(
                "Delete Failed",
                error instanceof Error
                  ? error.message
                  : "Failed to delete the activity. Please try again."
              );
            }
          }
        }
      ]
    );
  };

  const getActivityIcon = (type: string) => {
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

  const getActivityColor = (type: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getPetName = (petId: string) => {
    return pets.find((p) => p.id === petId)?.name || "Unknown Pet";
  };

  if (!activity) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background }
        ]}
      >
        <View style={styles.emptyContainer}>
          <IconSymbol
            name="exclamationmark.circle"
            size={48}
            color={Colors[colorScheme].icon}
          />
          <ThemedText style={styles.emptyTitle} type="title">
            Activity Not Found
          </ThemedText>
          <ThemedText
            style={[styles.emptyMessage, { color: Colors[colorScheme].icon }]}
          >
            The activity you're looking for couldn't be found.
          </ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background }
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: Colors[colorScheme].border }
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getActivityColor(activity.type) }
            ]}
          >
            <IconSymbol
              name={getActivityIcon(activity.type)}
              size={32}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.headerContent}>
            <ThemedText style={styles.activityTitle} type="title">
              {activity.title}
            </ThemedText>
            <ThemedText
              style={[styles.petName, { color: Colors[colorScheme].icon }]}
            >
              {getPetName(activity.pet_id)}
            </ThemedText>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle} type="subtitle">
            When
          </ThemedText>
          <View style={styles.dateTimeContainer}>
            <ThemedText style={styles.dateText}>
              {formatDate(activity.activity_date)}
            </ThemedText>
            <ThemedText
              style={[styles.timeText, { color: Colors[colorScheme].icon }]}
            >
              at {formatTime(activity.activity_date)}
            </ThemedText>
          </View>
        </View>

        {/* Activity Details */}
        {(activity.duration || activity.distance || activity.calories) && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type="subtitle">
              Details
            </ThemedText>
            <View style={styles.detailsGrid}>
              {activity.duration && (
                <View style={styles.detailCard}>
                  <IconSymbol
                    name="clock"
                    size={20}
                    color={Colors[colorScheme].icon}
                  />
                  <ThemedText style={styles.detailLabel}>Duration</ThemedText>
                  <ThemedText style={styles.detailValue} type="defaultSemiBold">
                    {activity.duration} mins
                  </ThemedText>
                </View>
              )}

              {activity.distance && (
                <View style={styles.detailCard}>
                  <IconSymbol
                    name="location"
                    size={20}
                    color={Colors[colorScheme].icon}
                  />
                  <ThemedText style={styles.detailLabel}>Distance</ThemedText>
                  <ThemedText style={styles.detailValue} type="defaultSemiBold">
                    {activity.distance.toFixed(1)} km
                  </ThemedText>
                </View>
              )}

              {activity.calories && (
                <View style={styles.detailCard}>
                  <IconSymbol
                    name="flame"
                    size={20}
                    color={Colors[colorScheme].icon}
                  />
                  <ThemedText style={styles.detailLabel}>Calories</ThemedText>
                  <ThemedText style={styles.detailValue} type="defaultSemiBold">
                    {activity.calories} kcal
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {activity.description && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle} type="subtitle">
              Notes
            </ThemedText>
            <View
              style={[
                styles.notesCard,
                {
                  backgroundColor: Colors[colorScheme].background,
                  borderColor: Colors[colorScheme].border
                }
              ]}
            >
              <ThemedText style={styles.notesText}>
                {activity.description}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              loading && styles.disabledButton
            ]}
            onPress={handleEditActivity}
            disabled={loading}
          >
            <IconSymbol name="pencil" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>
              Edit Activity
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              loading && styles.disabledButton
            ]}
            onPress={handleDeleteActivity}
            disabled={loading}
          >
            <IconSymbol name="trash" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>
              {loading ? "Deleting..." : "Delete"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  headerContent: {
    flex: 1
  },
  activityTitle: {
    fontSize: 24,
    marginBottom: 4
  },
  petName: {
    fontSize: 16
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12
  },
  dateTimeContainer: {
    gap: 4
  },
  dateText: {
    fontSize: 16
  },
  timeText: {
    fontSize: 14
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  detailCard: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    alignItems: "center",
    gap: 8
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center"
  },
  detailValue: {
    fontSize: 16,
    textAlign: "center"
  },
  notesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8
  },
  editButton: {
    backgroundColor: "#4CAF50"
  },
  deleteButton: {
    backgroundColor: "#F44336"
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32
  },
  backButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  },
  disabledButton: {
    backgroundColor: "#CCCCCC"
  }
});
