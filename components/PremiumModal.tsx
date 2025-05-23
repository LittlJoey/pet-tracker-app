import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

type PremiumModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function PremiumModal({ visible, onClose, onUpgrade }: PremiumModalProps) {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <ThemedView style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark.circle.fill" size={24} color="#999999" />
          </TouchableOpacity>
          <IconSymbol name="crown.fill" size={60} color="#FFD700" style={styles.icon} />
          <ThemedText type="title" style={styles.title}>
            Upgrade to Premium
          </ThemedText>
          <ThemedText style={styles.description}>
            You've reached the limit of 2 pet profiles. Upgrade to Premium to add unlimited pet
            profiles and unlock all features!
          </ThemedText>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <ThemedText style={styles.buttonText}>Upgrade Now</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 25,
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
