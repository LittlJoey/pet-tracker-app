import { PetTrack, TracksDao } from "@/lib/dao/tracksDao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type TrackState = {
  tracks: PetTrack[];
  loading: boolean;
  error: string | null;
};

const initialState: TrackState = {
  tracks: [],
  loading: false,
  error: null
};

export const fetchTracks = createAsyncThunk(
  "tracks/fetchTracks",
  async (petId: string) => {
    const tracks = await TracksDao.getPetTracks(petId);
    await AsyncStorage.setItem(`tracks_${petId}`, JSON.stringify(tracks));
    return tracks;
  }
);

export const fetchAllTracks = createAsyncThunk(
  "tracks/fetchAllTracks",
  async () => {
    const tracks = await TracksDao.getAllUserTracks();
    await AsyncStorage.setItem("all_tracks", JSON.stringify(tracks));
    return tracks;
  }
);

export const addTrack = createAsyncThunk(
  "tracks/addTrack",
  async (track: PetTrack) => {
    const savedTrack = await TracksDao.saveTrack(track);
    if (!savedTrack) throw new Error("Failed to save track");

    const localTracks = await AsyncStorage.getItem(`tracks_${track.pet_id}`);
    const tracks = localTracks ? JSON.parse(localTracks) : [];
    const updatedTracks = [...tracks, savedTrack];
    await AsyncStorage.setItem(
      `tracks_${track.pet_id}`,
      JSON.stringify(updatedTracks)
    );

    return savedTrack;
  }
);

export const deleteTrack = createAsyncThunk(
  "tracks/deleteTrack",
  async ({ id, petId }: { id: string; petId: string }) => {
    const success = await TracksDao.deleteTrack(id);
    if (!success) throw new Error("Failed to delete track");

    const localTracks = await AsyncStorage.getItem(`tracks_${petId}`);
    if (localTracks) {
      const tracks = JSON.parse(localTracks);
      const updatedTracks = tracks.filter((t: PetTrack) => t.id !== id);
      await AsyncStorage.setItem(
        `tracks_${petId}`,
        JSON.stringify(updatedTracks)
      );
    }

    return { id, petId };
  }
);

const trackSlice = createSlice({
  name: "tracks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    HYDRATE: (state, action: PayloadAction<{ tracks?: TrackState }>) => {
      return { ...state, ...action.payload.tracks };
    }
  },
  extraReducers: (builder) => {
    // Fetch Tracks
    builder
      .addCase(fetchTracks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = action.payload;
      })
      .addCase(fetchTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch tracks";
      })
      // Fetch All Tracks
      .addCase(fetchAllTracks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = action.payload;
      })
      .addCase(fetchAllTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch all tracks";
      })
      // Add Track
      .addCase(addTrack.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTrack.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks.push(action.payload);
      })
      .addCase(addTrack.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to add track";
      })
      // Delete Track
      .addCase(deleteTrack.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrack.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = state.tracks.filter(
          (track) => track.id !== action.payload.id
        );
      })
      .addCase(deleteTrack.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete track";
      });
  }
});

export const { clearError } = trackSlice.actions;
export default trackSlice.reducer;
