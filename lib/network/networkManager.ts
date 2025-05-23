import { store } from "@/store";
import {
  setOnlineStatus,
  startSync,
  syncComplete,
  syncError
} from "@/store/syncSlice";
import NetInfo from "@react-native-community/netinfo";
import { fetchPets } from "../../store/petSlice";
import { fetchTracks } from "../../store/trackSlice";

export class NetworkManager {
  private static isOnline = false;
  private static syncInterval: NodeJS.Timeout | null = null;

  static async initialize() {
    // Set up network state listener
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      const isConnected = state.isConnected ?? false;
      this.isOnline = isConnected;
      store.dispatch(setOnlineStatus(isConnected));

      // If we just came back online, trigger a sync
      if (wasOffline && isConnected) {
        this.syncData();
      }
    });

    // Start periodic sync check
    this.startPeriodicSync();
  }

  static async syncData() {
    if (!this.isOnline) return;

    try {
      store.dispatch(startSync());
      await Promise.all([
        store.dispatch(fetchPets()),
        store.dispatch(fetchTracks(store.getState().pets.selectedPet?.id || ""))
      ]);
      store.dispatch(syncComplete());
    } catch (error) {
      console.error("Error during sync:", error);
      store.dispatch(
        syncError(
          error instanceof Error ? error.message : "Unknown error occurred"
        )
      );
    }
  }

  private static startPeriodicSync() {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up new interval - sync every 5 minutes if online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  static cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  static isNetworkAvailable(): boolean {
    return this.isOnline;
  }
}
