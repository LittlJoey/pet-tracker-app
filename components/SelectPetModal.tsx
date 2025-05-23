import { Pet } from "@/app/(tabs)/pets";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectPet } from "@/store/petSlice";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

type SelectPetModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: () => void;
};

export function SelectPetModal({
  visible,
  onClose,
  onSelect
}: SelectPetModalProps) {
  const pets = useAppSelector((state) => state.pets.pets);
  const dispatch = useAppDispatch();
  const handleSelectPet = (pet: Pet) => {
    dispatch(selectPet(pet));
    onSelect();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Select a Pet</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#999999" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.petList}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petItem}
                onPress={() => handleSelectPet(pet)}
              >
                <View style={styles.petIcon}>
                  {pet.avatar ? (
                    <Image source={{ uri: pet.avatar }} style={styles.avatar} />
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
                <IconSymbol name="chevron.right" size={20} color="#999999" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  closeButton: {
    padding: 5
  },
  petList: {
    maxHeight: 400
  },
  petItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  petIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20
  },
  petName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600"
  }
});
