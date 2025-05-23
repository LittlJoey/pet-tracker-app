import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SyncState {
  isOnline: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  error: string | null;
}

const initialState: SyncState = {
  isOnline: false,
  lastSyncTime: null,
  isSyncing: false,
  error: null
};

const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    startSync: (state) => {
      state.isSyncing = true;
      state.error = null;
    },
    syncComplete: (state) => {
      state.isSyncing = false;
      state.lastSyncTime = Date.now();
      state.error = null;
    },
    syncError: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.error = action.payload;
    }
  }
});

export const { setOnlineStatus, startSync, syncComplete, syncError } =
  syncSlice.actions;
export default syncSlice.reducer;
