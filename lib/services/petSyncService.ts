import { NetworkManager } from "../network/networkManager";

export class PetSyncService {
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    // Initialize network manager and start sync monitoring
    NetworkManager.initialize();
    this.isInitialized = true;
  }

  static cleanup() {
    if (!this.isInitialized) return;

    // Clean up network manager
    NetworkManager.cleanup();
    this.isInitialized = false;
  }

  static isOnline(): boolean {
    return NetworkManager.isNetworkAvailable();
  }

  static async syncNow() {
    return NetworkManager.syncData();
  }
}
