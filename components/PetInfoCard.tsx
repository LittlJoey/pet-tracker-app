import { Pet } from "@/app/(tabs)/pets";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

type PetInfoCardProps = {
  pet: Pet;
  onPress?: () => void;
};

export function PetInfoCard({ pet, onPress }: PetInfoCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    if (onPress) onPress();
  };
  // Calculate upcoming health reminders
  const getUpcomingReminders = () => {
    if (!pet.healthRecords || pet.healthRecords.length === 0) {
      return null;
    }

    const now = new Date();
    const upcomingRecords = pet.healthRecords
      .filter((record) => record.nextDue && new Date(record.nextDue) > now)
      .sort(
        (a, b) =>
          new Date(a.nextDue!).getTime() - new Date(b.nextDue!).getTime()
      );

    if (upcomingRecords.length === 0) {
      return null;
    }

    const nextRecord = upcomingRecords[0];
    const dueDate = new Date(nextRecord.nextDue!);
    const daysUntil = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      title: nextRecord.title,
      daysUntil,
      type: nextRecord.type
    };
  };

  // Get latest weight
  const getLatestWeight = () => {
    if (!pet.weightHistory || pet.weightHistory.length === 0) {
      return null;
    }
    return pet.weightHistory[pet.weightHistory.length - 1];
  };

  // Calculate age
  const calculateAge = () => {
    const birthDate = new Date(pet.birthDate);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const months = now.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
    }

    return years;
  };

  const reminder = getUpcomingReminders();
  const latestWeight = getLatestWeight();
  const age = calculateAge();

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return "syringe";
      case "vet-visit":
        return "stethoscope";
      case "medication":
        return "pill";
      default:
        return "calendar";
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={["#4CAF50", "#45a049"]}
          style={styles.headerGradient}
        >
          <ThemedText style={styles.headerTitle}>
            {pet.name}'s Profile
          </ThemedText>
        </LinearGradient>
        <ThemedView style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {pet.avatar ? (
                <Image source={{ uri: pet.avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    {
                      backgroundColor:
                        pet.species === "dog" ? "#FFB6C1" : "#B6E3FF"
                    }
                  ]}
                >
                  <IconSymbol
                    name={
                      pet.species === "dog"
                        ? "pawprint.fill"
                        : pet.species === "cat"
                        ? "cat.fill"
                        : "leaf.fill"
                    }
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </View>
            <View style={styles.petInfo}>
              <ThemedText type="defaultSemiBold" style={styles.petName}>
                {pet.name}
              </ThemedText>
              <ThemedText style={styles.petDetails}>
                {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)} •{" "}
                {age} {age === 1 ? "year" : "years"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoSection}>
            {latestWeight && (
              <View style={styles.infoItem}>
                <IconSymbol name="scalemass" size={16} color="#4CAF50" />
                <ThemedText style={styles.infoText}>
                  {latestWeight.weight} kg
                </ThemedText>
              </View>
            )}

            {reminder && (
              <View style={styles.infoItem}>
                <IconSymbol name="bell.fill" size={16} color="#FF9800" />
                <ThemedText style={styles.infoText}>
                  {reminder.title} in {reminder.daysUntil}{" "}
                  {reminder.daysUntil === 1 ? "day" : "days"}
                </ThemedText>
              </View>
            )}
          </View>

          {pet.notes && (
            <View style={styles.notesSection}>
              <ThemedText numberOfLines={2} style={styles.notes}>
                {pet.notes}
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </TouchableOpacity>
    </Animated.View>
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
    flexDirection: "row",
    marginBottom: 12
  },
  headerGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center"
  },
  petInfo: {
    flex: 1,
    justifyContent: "center"
  },
  petName: {
    fontSize: 18,
    marginBottom: 4
  },
  petDetails: {
    fontSize: 14,
    opacity: 0.7
  },
  infoSection: {
    marginBottom: 12
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 8
  },
  notes: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.8
  }
});
