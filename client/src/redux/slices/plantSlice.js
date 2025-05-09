import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';

export const fetchPlants = createAsyncThunk('plants/fetchPlants', async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.user?.id) {
        return rejectWithValue({ message: 'User not authenticated' });
    }
    try {
        const response = await api.get('/api/plants');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to fetch plants' });
    }
});

export const addPlant = createAsyncThunk('plants/addPlant', async (plantData, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.user?.id) {
        return rejectWithValue({ message: 'User not authenticated' });
    }
    try {
        const response = await api.post('/api/plants', plantData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to add plant' });
    }
});

export const updatePlant = createAsyncThunk('plants/updatePlant', async ({ id, plantData }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.user?.id) {
        return rejectWithValue({ message: 'User not authenticated' });
    }
    try {
        const response = await api.put(`/api/plants/${id}`, plantData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to update plant' });
    }
});

export const deletePlant = createAsyncThunk('plants/deletePlant', async (id, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.user?.id) {
        return rejectWithValue({ message: 'User not authenticated' });
    }
    try {
        await api.delete(`/api/plants/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to delete plant' });
    }
});

export const deletePlantPhoto = createAsyncThunk('plants/deletePlantPhoto', async (photoId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.user?.id) {
        return rejectWithValue({ message: 'User not authenticated' });
    }
    try {
        const response = await api.delete(`/api/plants/photo/${photoId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Failed to delete plant photo' });
    }
});

export const addPlantPhoto = createAsyncThunk('plants/addPlantPhoto', async ({ plantId, photo }, { getState, rejectWithValue }) => {
    const { auth } = getState();
    if (!auth.user?.id) {
        return rejectWithValue({ message: 'User not authenticated' });
    }
    try {
        const response = await api.post(
            `/api/plants/${plantId}/photo`,
            { photoUrl: photo, uploadedAt: new Date().toISOString() }
        );
        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const message =
            status === 413
                ? "Ukuran file terlalu besar. Silakan unggah gambar maksimal 2MB."
                : error.response?.data?.message || "Gagal menambahkan foto tanaman";
        return rejectWithValue({ plantId, message });
    }

});

const plantSlice = createSlice({
    name: "plants",
    initialState: {
        plants: [],
        loading: false,
        deletingPhotoId: null,
        errors: {
            addPlantPhoto: {},
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchPlants
            .addCase(fetchPlants.pending, (state) => {
                state.loading = true;
                state.errors.fetchPlants = null;
            })
            .addCase(fetchPlants.fulfilled, (state, action) => {
                state.loading = false;
                state.plants = action.payload;
                state.errors.fetchPlants = null;
            })
            .addCase(fetchPlants.rejected, (state, action) => {
                state.loading = false;
                state.errors.fetchPlants = action.payload.message;
            })
            // addPlant
            .addCase(addPlant.pending, (state) => {
                state.loading = true;
                state.errors.addPlant = null;
            })
            .addCase(addPlant.fulfilled, (state, action) => {
                state.loading = false;
                state.plants.push(action.payload.plant);
                state.errors.addPlant = null;
            })
            .addCase(addPlant.rejected, (state, action) => {
                state.loading = false;
                state.errors.addPlant = action.payload.message;
            })
            // updatePlant
            .addCase(updatePlant.pending, (state) => {
                state.loading = true;
                state.errors.updatePlant = null;
            })
            .addCase(updatePlant.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.plants.findIndex(
                    (plant) => plant.id === action.payload.id
                );
                if (index !== -1) {
                    state.plants[index] = action.payload;
                }
                state.errors.updatePlant = null;
            })
            .addCase(updatePlant.rejected, (state, action) => {
                state.loading = false;
                state.errors.updatePlant = action.payload.message;
            })
            // deletePlant
            .addCase(deletePlant.pending, (state) => {
                state.loading = true;
                state.errors.deletePlant = null;
            })
            .addCase(deletePlant.fulfilled, (state, action) => {
                state.loading = false;
                state.plants = state.plants.filter(
                    (plant) => plant.id !== action.payload
                );
                state.errors.deletePlant = null;
            })
            .addCase(deletePlant.rejected, (state, action) => {
                state.loading = false;
                state.errors.deletePlant = action.payload.message;
            })
            // deletePlantPhoto
            .addCase(deletePlantPhoto.pending, (state, action) => {
                state.deletingPhotoId = action.meta.arg;
                state.errors.deletePlantPhoto = null;
            })
            .addCase(deletePlantPhoto.fulfilled, (state, action) => {
                state.deletingPhotoId = null;
                const updatedPlant = action.payload;
                const idx = state.plants.findIndex(p => p.id === updatedPlant.id);
                if (idx !== -1) state.plants[idx] = updatedPlant;
            })
            .addCase(deletePlantPhoto.rejected, (state, action) => {
                state.deletingPhotoId = null;
                state.errors.deletePlantPhoto = action.payload.message;
            })
            // addPlantPhoto
            .addCase(addPlantPhoto.pending, (state, action) => {
                const { plantId } = action.meta.arg;
                state.loading = true;
                state.errors.addPlantPhoto[plantId] = null;
            })
            .addCase(addPlantPhoto.fulfilled, (state, action) => {
                const updatedPlant = action.payload;
                const index = state.plants.findIndex(p => p.id === updatedPlant.id);
                if (index !== -1) state.plants[index] = updatedPlant;
                state.loading = false;
                state.errors.addPlantPhoto[updatedPlant.id] = null;
            })

            .addCase(addPlantPhoto.rejected, (state, action) => {
                state.loading = false;
                const { plantId } = action.meta.arg;
                state.errors.addPlantPhoto[plantId] = action.payload.message;
            });
    },
});

export default plantSlice.reducer;