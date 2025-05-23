import { Pet } from "@/app/(tabs)/pets";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectPet } from "@/store/petSlice";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

type FloatingPetSelectorProps = {
  onSelectPet?: (pet: Pet) => void;
};

export function FloatingPetSelector({ onSelectPet }: FloatingPetSelectorProps) {
  const pets = useAppSelector((state) => state.pets.pets);
  const selectedPet = useAppSelector((state) => state.pets.selectedPet);
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  const handleSelectPet = (pet: Pet) => {
    dispatch(selectPet(pet));
    setExpanded(false);
    if (onSelectPet) {
      onSelectPet(pet);
    }
  };

  if (pets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {expanded ? (
        <ThemedView style={styles.expandedContainer}>
          <View style={styles.header}>
            <ThemedText type="defaultSemiBold">Select Pet</ThemedText>
            <TouchableOpacity onPress={() => setExpanded(false)}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#999999" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.petList}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petItem,
                  selectedPet?.id === pet.id && styles.selectedPet
                ]}
                onPress={() => handleSelectPet(pet)}
              >
                <View style={styles.petAvatar}>
                  {pet.avatar ? (
                    <Image
                      source={{ uri: pet.avatar }}
                      style={styles.avatarImage}
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
                </View>
                <ThemedText style={styles.petName}>{pet.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      ) : (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setExpanded(true)}
        >
          {selectedPet?.avatar ? (
            <Image
              source={{ uri: selectedPet.avatar }}
              style={styles.selectedAvatar}
            />
          ) : (
            <IconSymbol
              name={
                selectedPet?.species === "dog"
                  ? "pawprint.fill"
                  : selectedPet?.species === "cat"
                  ? "cat.fill"
                  : "leaf.fill"
              }
              size={28}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1000
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  selectedAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  expandedContainer: {
    width: 250,
    maxHeight: 300,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE"
  },
  petList: {
    maxHeight: 240
  },
  petItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE"
  },
  selectedPet: {
    backgroundColor: "rgba(76, 175, 80, 0.1)"
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  petName: {
    fontSize: 16,
    fontWeight: "500"
  }
});
