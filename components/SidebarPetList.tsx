import { Pet } from "@/app/(tabs)/pets";
import { Colors } from "@/constants/Colors";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectPet } from "@/store/petSlice";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

export function SidebarPetList() {
  const pets = useAppSelector((state) => state.pets.pets);
  const selectedPet = useAppSelector((state) => state.pets.selectedPet);
  const dispatch = useAppDispatch();

  const handleSelectPet = (pet: Pet) => {
    dispatch(selectPet(pet));
  };

  if (pets.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {pets.map((pet) => (
        <TouchableOpacity
          key={pet.id}
          style={[
            styles.petItem,
            selectedPet?.id === pet.id && styles.selectedPet
          ]}
          lightColor={Colors.light.trasparent}
          darkColor={Colors.dark.transparent}
          onPress={() => handleSelectPet(pet)}
        >
          {pet.avatar ? (
            <Image source={{ uri: pet.avatar }} style={styles.avatar} />
          ) : (
            <ThemedView
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: pet.species === "dog" ? "#FFB6C1" : "#B6E3FF"
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
            </ThemedView>
          )}
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.petItem,
          !selectedPet && styles.selectedPet,
          { backgroundColor: Colors.light.background }
        ]}
        onPress={() => dispatch(selectPet(null))}
      >
        <ThemedView style={styles.avatarPlaceholder}>
          <IconSymbol
            name="pawprint.fill"
            size={24}
            color={Colors.light.tint}
          />
          <IconSymbol
            name="plus.circle.fill"
            size={12}
            color={Colors.light.tint}
            style={styles.plusIcon}
          />
          <ThemedText style={styles.allPetsLabel}>All</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    right: 12,
    bottom: 20,
    transform: [{ translateY: -100 }],
    zIndex: 1000,
    gap: 12
  },
  petItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.trasparent,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5
  },
  selectedPet: {
    borderWidth: 2,
    borderColor: Colors.light.tint
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 24
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  plusIcon: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 6
  },
  allPetsLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.light.tint,
    marginTop: 2
  }
});
