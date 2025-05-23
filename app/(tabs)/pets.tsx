import { CreatePetModal } from "@/components/CreatePetModal";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { PremiumModal } from "@/components/PremiumModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAppSelector } from "@/store";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme
} from "react-native";

export type Pet = {
  id: string;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  gender: "Boy" | "Girl";
  birthDate: string; // Changed from Date to string to ensure Redux serialization
  weightHistory: WeightEntry[];
  notes: string;
  avatar?: string;
  healthRecords?: HealthRecord[];
};

type WeightEntry = {
  date: string; // Changed from Date to string for consistency
  weight: number;
};

type HealthRecord = {
  id: string;
  type: "vaccination" | "vet-visit" | "medication";
  date: string;
  title: string;
  notes?: string;
  nextDue?: string;
};

export const VACCINATION_OPTIONS = [
  "Rabies",
  "Distemper",
  "Parvovirus",
  "Bordetella",
  "Leptospirosis",
  "FVRCP (Cats)",
  "FeLV (Cats)",
  "Other"
];

export const VET_VISIT_OPTIONS = [
  "Annual Check-up",
  "Emergency Visit",
  "Dental Cleaning",
  "Surgery",
  "Grooming",
  "Other"
];

export const MEDICATION_OPTIONS = [
  "Antibiotics",
  "Pain Medication",
  "Flea & Tick Prevention",
  "Heartworm Prevention",
  "Allergy Medication",
  "Other"
];

export default function PetsScreen() {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const pets = useAppSelector((state) => state.pets.pets);
  const colorScheme = useColorScheme() ?? "light";

  const handleCreatePet = (petData: Pet) => {
    console.log("Creating pet:", petData);
    setIsCreateModalVisible(false);
  };

  const handleUpgrade = () => {
    // Implement upgrade logic here
    console.log("Upgrading to premium");
    setIsPremiumModalVisible(false);
  };

  const renderPetCard = (pet: Pet) => (
    <TouchableOpacity
      key={pet.id}
      style={[styles.petCard, colorScheme === "dark" && styles.petCardDark]}
      onPress={() => {
        console.log("Pet card clicked:", pet);
        router.navigate({
          pathname: "/pet",
          params: { petId: pet.id }
        });
      }}
    >
      <ThemedView
        style={[
          styles.petIcon,
          !pet.avatar &&
            (colorScheme === "dark"
              ? styles.petIconBackgroundDark
              : styles.petIconBackground)
        ]}
      >
        {pet.avatar ? (
          <Image
            source={{ uri: pet.avatar }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <IconSymbol
            name={
              pet.species === "dog"
                ? "pawprint.fill"
                : pet.species === "cat"
                ? "cat.fill"
                : "leaf.fill"
            }
            size={24}
            color="#4CAF50"
          />
        )}
      </ThemedView>
      <ThemedView style={styles.petInfo}>
        <ThemedText type="defaultSemiBold" style={styles.petName}>
          {pet.name}
        </ThemedText>
        <ThemedText
          style={[
            styles.petDetails,
            colorScheme === "dark" && styles.petDetailsDark
          ]}
        >
          {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)} •{" "}
          {pet.breed}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#FFB6C1", dark: "#4A2639" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="pawprint.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Pets</ThemedText>
      </ThemedView>
      <ThemedView style={styles.container}>
        {pets.length === 0 ? (
          <ThemedText style={styles.emptyText}>No pets added yet.</ThemedText>
        ) : (
          <ThemedView style={styles.petsGrid}>
            {pets.map(renderPetCard)}
          </ThemedView>
        )}
        <TouchableOpacity
          style={[
            styles.createButton,
            colorScheme === "dark" && styles.createButtonDark
          ]}
          onPress={() => {
            if (pets.length >= 2) {
              setIsPremiumModalVisible(true);
            } else {
              setIsCreateModalVisible(true);
            }
          }}
        >
          <IconSymbol name="plus.circle.fill" size={24} color="#ffffff" />
          <ThemedText
            style={[
              styles.buttonText,
              colorScheme === "dark" && styles.buttonTextDark
            ]}
          >
            Add New Pet
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <CreatePetModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreatePet}
      />
      <PremiumModal
        visible={isPremiumModalVisible}
        onClose={() => setIsPremiumModalVisible(false)}
        onUpgrade={handleUpgrade}
      />
    </ParallaxScrollView>
  );
}

import { Colors } from "@/constants/Colors";

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute"
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  emptyText: {
    marginBottom: 20
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8
  },
  createButtonDark: {
    backgroundColor: Colors.dark.success
  },
  buttonText: {
    color: Colors.light.background,
    fontWeight: "600"
  },
  buttonTextDark: {
    color: Colors.dark.background
  },
  petsGrid: {
    width: "100%",
    gap: 16,
    marginBottom: 20
  },
  petCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
    backgroundColor: Colors.light.background,
    shadowColor: Colors.light.text,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center"
  },
  petCardDark: {
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
    shadowColor: Colors.dark.text
  },
  petIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  petIconBackground: {
    backgroundColor: Colors.light.border
  },
  petIconBackgroundDark: {
    backgroundColor: Colors.dark.border
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25
  },
  petInfo: {
    flex: 1
  },
  petName: {
    fontSize: 18,
    marginBottom: 4
  },
  petDetails: {
    fontSize: 14,
    color: Colors.light.placeholder
  },
  petDetailsDark: {
    color: Colors.dark.placeholder
  }
});
