import { ActivitiesDao, PetActivity } from "@/lib/dao/activitiesDao";
import { TracksDao } from "@/lib/dao/tracksDao";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ActivityStats {
  totalWalks: number;
  totalDistance: number;
  totalMeals: number;
  totalActivities: number;
}

interface ActivitiesState {
  activities: PetActivity[];
  todayActivities: PetActivity[];
  stats: ActivityStats;
  loading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  activities: [],
  todayActivities: [],
  stats: {
    totalWalks: 0,
    totalDistance: 0,
    totalMeals: 0,
    totalActivities: 0
  },
  loading: false,
  error: null
};

// Async Thunks
export const fetchTodayActivities = createAsyncThunk(
  "activities/fetchTodayActivities",
  async (params: { petId?: string } = {}, { rejectWithValue }) => {
    try {
      console.log("Fetching today activities for petId:", params.petId);
      const activities = await ActivitiesDao.getTodayActivities(params.petId);
      console.log("Today activities:", activities);
      return activities;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch today's activities"
      );
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  "activities/fetchActivityStats",
  async (params: { petId?: string } = {}, { rejectWithValue }) => {
    try {
      const stats = await ActivitiesDao.getActivityStats(params.petId);
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch activity stats"
      );
    }
  }
);

export const fetchAllUserActivities = createAsyncThunk(
  "activities/fetchAllUserActivities",
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const activities = await ActivitiesDao.getAllUserActivities(params.limit);
      return activities;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch user activities"
      );
    }
  }
);

export const fetchPetActivities = createAsyncThunk(
  "activities/fetchPetActivities",
  async (
    { petId, limit }: { petId: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const activities = await ActivitiesDao.getPetActivities(petId, limit);
      return activities;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch pet activities"
      );
    }
  }
);

export const addActivity = createAsyncThunk(
  "activities/addActivity",
  async (
    activity: Omit<PetActivity, "user_id" | "created_at" | "updated_at">,
    { rejectWithValue }
  ) => {
    try {
      const savedActivity = await ActivitiesDao.saveActivity(activity);
      if (!savedActivity) {
        throw new Error("Failed to save activity");
      }
      return savedActivity;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add activity"
      );
    }
  }
);

export const updateActivity = createAsyncThunk(
  "activities/updateActivity",
  async (activity: PetActivity, { rejectWithValue }) => {
    try {
      const updatedActivity = await ActivitiesDao.updateActivity(activity);
      if (!updatedActivity) {
        throw new Error("Failed to update activity");
      }
      return updatedActivity;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update activity"
      );
    }
  }
);

export const deleteActivity = createAsyncThunk(
  "activities/deleteActivity",
  async (activityId: string, { rejectWithValue }) => {
    try {
      const success = await ActivitiesDao.deleteActivity(activityId);
      if (!success) {
        throw new Error("Failed to delete activity");
      }
      return activityId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete activity"
      );
    }
  }
);

// Sync walk tracks as activities
export const syncWalkTracks = createAsyncThunk(
  "activities/syncWalkTracks",
  async (petId: string, { rejectWithValue }) => {
    try {
      const tracks = await TracksDao.getPetTracks(petId);
      const walkActivities: PetActivity[] = [];

      for (const track of tracks) {
        const existingActivity = await ActivitiesDao.getActivity(
          `track_${track.id}`
        );
        if (!existingActivity) {
          // Convert track to activity and save
          const activityData = ActivitiesDao.convertTrackToActivity(track);
          const savedActivity = await ActivitiesDao.saveActivity(activityData);
          if (savedActivity) {
            walkActivities.push(savedActivity);
          }
        }
      }

      return walkActivities;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to sync walk tracks"
      );
    }
  }
);

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearActivities: (state) => {
      state.activities = [];
      state.todayActivities = [];
    },
    // Optimistic updates for better UX
    addActivityOptimistic: (state, action: PayloadAction<PetActivity>) => {
      state.todayActivities.unshift(action.payload);
      state.activities.unshift(action.payload);
    },
    removeActivityOptimistic: (state, action: PayloadAction<string>) => {
      state.todayActivities = state.todayActivities.filter(
        (a) => a.id !== action.payload
      );
      state.activities = state.activities.filter(
        (a) => a.id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Today Activities
      .addCase(fetchTodayActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.todayActivities = action.payload;
      })
      .addCase(fetchTodayActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Activity Stats
      .addCase(fetchActivityStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch All User Activities
      .addCase(fetchAllUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUserActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchAllUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Pet Activities
      .addCase(fetchPetActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPetActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchPetActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add Activity
      .addCase(addActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addActivity.fulfilled, (state, action) => {
        state.loading = false;
        // Add to both lists
        state.activities.unshift(action.payload);
        // Check if it's today's activity
        const today = new Date();
        const activityDate = new Date(action.payload.activity_date);
        if (activityDate.toDateString() === today.toDateString()) {
          state.todayActivities.unshift(action.payload);
        }
      })
      .addCase(addActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Activity
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        const updatedActivity = action.payload;

        // Update in activities list
        const activityIndex = state.activities.findIndex(
          (a) => a.id === updatedActivity.id
        );
        if (activityIndex !== -1) {
          state.activities[activityIndex] = updatedActivity;
        }

        // Update in today's activities if applicable
        const todayIndex = state.todayActivities.findIndex(
          (a) => a.id === updatedActivity.id
        );
        if (todayIndex !== -1) {
          state.todayActivities[todayIndex] = updatedActivity;
        }
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Activity
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        const activityId = action.payload;
        state.activities = state.activities.filter((a) => a.id !== activityId);
        state.todayActivities = state.todayActivities.filter(
          (a) => a.id !== activityId
        );
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Sync Walk Tracks
      .addCase(syncWalkTracks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncWalkTracks.fulfilled, (state, action) => {
        state.loading = false;
        // Add synced walk activities
        const newActivities = action.payload;
        newActivities.forEach((activity) => {
          if (!state.activities.find((a) => a.id === activity.id)) {
            state.activities.push(activity);

            // Check if it's today's activity
            const today = new Date();
            const activityDate = new Date(activity.activity_date);
            if (activityDate.toDateString() === today.toDateString()) {
              state.todayActivities.push(activity);
            }
          }
        });

        // Sort by date
        state.activities.sort(
          (a, b) =>
            new Date(b.activity_date).getTime() -
            new Date(a.activity_date).getTime()
        );
        state.todayActivities.sort(
          (a, b) =>
            new Date(b.activity_date).getTime() -
            new Date(a.activity_date).getTime()
        );
      })
      .addCase(syncWalkTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  clearError,
  clearActivities,
  addActivityOptimistic,
  removeActivityOptimistic
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
