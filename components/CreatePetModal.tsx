import { Modal, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Pet } from "@/app/(tabs)/pets";
import { useAppSelector, useAppDispatch } from "@/store";
import { addPet } from "@/store/petSlice";
import { PremiumModal } from "@/components/PremiumModal";
import { PetForm } from "./PetForm";

type CreatePetModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (petData: Pet) => void;
};

export function CreatePetModal({
  visible,
  onClose,
  onSubmit
}: CreatePetModalProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const pets = useAppSelector((state) => state.pets.pets);
  const isPremium = useAppSelector((state) => state.pets.isPremium);
  const dispatch = useAppDispatch();

  const handleSubmit = (petData: Pet) => {
    if (pets.length >= 2 && !isPremium) {
      setShowPremiumModal(true);
      return;
    } else {
    }
    dispatch(addPet(petData));
    onSubmit(petData);
  };

  const handleUpgrade = () => {
    // Implement upgrade logic here
    setShowPremiumModal(false);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <ThemedView style={styles.centeredView}>
          <ThemedView style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#999999" />
            </TouchableOpacity>
            <ScrollView style={styles.formContainer}>
              <ThemedText type="title" style={styles.title}>
                Create Pet Profile
              </ThemedText>
              {/* Form fields will be added in the next step */}
              <PetForm onSubmit={handleSubmit} />
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%"
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 1
  },
  formContainer: {
    marginTop: 40
  },
  title: {
    marginBottom: 20,
    textAlign: "center"
  }
});
