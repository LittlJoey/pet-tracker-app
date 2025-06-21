import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchAllUserActivities,
  fetchTodayActivities
} from "@/store/activitiesSlice";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ActivitiesDebugger = () => {
  const dispatch = useAppDispatch();
  const { activities, todayActivities, loading, error } = useAppSelector(
    (state) => state.activities
  );
  const auth = useAppSelector((state) => state.auth);

  const testFetchToday = () => {
    console.log("🧪 Debug: Testing fetchTodayActivities");
    dispatch(fetchTodayActivities({}));
  };

  const testFetchAll = () => {
    console.log("🧪 Debug: Testing fetchAllUserActivities");
    dispatch(fetchAllUserActivities({}));
  };

  const logCurrentState = () => {
    console.log("🧪 Debug: Current Redux State:");
    console.log("- activities count:", activities.length);
    console.log("- todayActivities count:", todayActivities.length);
    console.log("- loading:", loading);
    console.log("- error:", error);
    console.log("- auth.isAuthenticated:", auth.isAuthenticated);
    console.log("- auth.user:", auth.user?.id);
    console.log("- activities data:", activities);
    console.log("- todayActivities data:", todayActivities);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activities Debug Panel</Text>

      <View style={styles.info}>
        <Text>Auth: {auth.isAuthenticated ? "✅" : "❌"}</Text>
        <Text>User: {auth.user?.email || "None"}</Text>
        <Text>Loading: {loading ? "🔄" : "✅"}</Text>
        <Text>Error: {error || "None"}</Text>
        <Text>Activities: {activities.length}</Text>
        <Text>Today Activities: {todayActivities.length}</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={testFetchToday}>
          <Text style={styles.buttonText}>Fetch Today</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testFetchAll}>
          <Text style={styles.buttonText}>Fetch All</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={logCurrentState}>
          <Text style={styles.buttonText}>Log State</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activities}>
        <Text style={styles.subtitle}>Today Activities:</Text>
        {todayActivities.map((activity, index) => (
          <Text key={activity.id} style={styles.activityItem}>
            {index + 1}. {activity.type} - {activity.title}
          </Text>
        ))}

        <Text style={styles.subtitle}>All Activities:</Text>
        {activities.slice(0, 5).map((activity, index) => (
          <Text key={activity.id} style={styles.activityItem}>
            {index + 1}. {activity.type} - {activity.title}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ff6b6b"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#ff6b6b"
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4
  },
  info: {
    marginBottom: 12
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 4,
    flex: 1
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 12
  },
  activities: {
    maxHeight: 200
  },
  activityItem: {
    fontSize: 12,
    marginBottom: 2
  }
});
