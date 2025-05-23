import { Pet } from "@/app/(tabs)/pets";
import { router } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { PetInfoCard } from "./PetInfoCard";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type PetGridProps = {
  pets: Pet[];
};

export function PetGrid({ pets }: PetGridProps) {
  if (!pets || pets.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No pets added yet.</ThemedText>
        <TouchableOpacity
          style={styles.addPetButton}
          onPress={() => router.navigate("/pets")}
        >
          <ThemedText style={styles.addPetButtonText}>Add a Pet</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        My Pets
      </ThemedText>
      <View style={styles.grid}>
        {pets.map((pet) => (
          <View key={pet.id} style={styles.gridItem}>
            <PetInfoCard
              pet={pet}
              onPress={() => {
                router.navigate({
                  pathname: "/pet",
                  params: { petId: pet.id }
                });
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const isSmallScreen = width < 375;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8
  },
  gridItem: {
    width: isSmallScreen ? "100%" : "50%",
    paddingHorizontal: 8
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderStyle: "dashed"
  },
  emptyText: {
    marginBottom: 16,
    opacity: 0.7
  },
  addPetButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  addPetButtonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  }
});
