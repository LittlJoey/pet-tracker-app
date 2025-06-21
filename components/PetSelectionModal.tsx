import { Pet } from "@/app/(tabs)/pets";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

interface PetSelectionModalProps {
  visible: boolean;
  pets: Pet[];
  selectedPetId?: string;
  onSelectPet: (pet: Pet) => void;
  onClose: () => void;
  title?: string;
}

export const PetSelectionModal: React.FC<PetSelectionModalProps> = ({
  visible,
  pets,
  selectedPetId,
  onSelectPet,
  onClose,
  title = "Select Pet"
}) => {
  const colorScheme = useColorScheme() ?? "light";

  const handleSelectPet = (pet: Pet) => {
    onSelectPet(pet);
    onClose();
  };

  const renderPetItem = ({ item: pet }: { item: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petItem,
        {
          backgroundColor: Colors[colorScheme].background,
          borderColor:
            selectedPetId === pet.id ? "#4CAF50" : Colors[colorScheme].border
        },
        selectedPetId === pet.id && styles.selectedPetItem
      ]}
      onPress={() => handleSelectPet(pet)}
    >
      <View style={styles.petInfo}>
        {pet.avatar ? (
          <Image source={{ uri: pet.avatar }} style={styles.petAvatar} />
        ) : (
          <View
            style={[
              styles.petAvatarPlaceholder,
              { backgroundColor: Colors[colorScheme].icon }
            ]}
          >
            <IconSymbol name="pawprint.fill" size={20} color="white" />
          </View>
        )}
        <View style={styles.petDetails}>
          <ThemedText style={styles.petName}>{pet.name}</ThemedText>
          <ThemedText
            style={[styles.petSpecies, { color: Colors[colorScheme].icon }]}
          >
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
          </ThemedText>
        </View>
      </View>
      {selectedPetId === pet.id && (
        <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: Colors[colorScheme].background }
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: Colors[colorScheme].border }
            ]}
          >
            <ThemedText style={styles.modalTitle} type="title">
              {title}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                name="xmark.circle.fill"
                size={24}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          </View>

          {/* Pet List */}
          {pets.length > 0 ? (
            <FlatList
              data={pets}
              renderItem={renderPetItem}
              keyExtractor={(pet) => pet.id}
              style={styles.petList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol
                name="pawprint.fill"
                size={48}
                color={Colors[colorScheme].icon}
              />
              <ThemedText style={styles.emptyTitle}>No Pets Found</ThemedText>
              <ThemedText
                style={[
                  styles.emptyMessage,
                  { color: Colors[colorScheme].icon }
                ]}
              >
                Add a pet first to continue
              </ThemedText>
            </View>
          )}

          {/* Cancel Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: Colors[colorScheme].border }
              ]}
              onPress={onClose}
            >
              <ThemedText
                style={[
                  styles.cancelButtonText,
                  { color: Colors[colorScheme].text }
                ]}
              >
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: 300
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600"
  },
  closeButton: {
    padding: 4
  },
  petList: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  petItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2
  },
  selectedPetItem: {
    borderColor: "#4CAF50",
    backgroundColor: "#F8FFF8"
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  petAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  petDetails: {
    flex: 1
  },
  petName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },
  petSpecies: {
    fontSize: 14
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center"
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5"
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center"
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500"
  }
});
