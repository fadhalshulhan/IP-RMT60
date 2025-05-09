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
        // Normalisasi respons
        const plant = response.data.plant || response.data;
        if (!plant?.id) {
            throw new Error('Invalid plant data from server');
        }
        return { plant };
    } catch (error) {
        console.error("addPlant error:", error);
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
                console.log("fetchPlants payload:", action.payload); // Debug payload
                state.plants = Array.isArray(action.payload)
                    ? action.payload.filter(plant => plant && plant.id)
                    : [];
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
                console.log("addPlant payload:", action.payload); // Debug payload
                const newPlant = action.payload?.plant;
                if (newPlant?.id) {
                    // Cek apakah tanaman sudah ada untuk menghindari duplikasi
                    if (!state.plants.some(p => p.id === newPlant.id)) {
                        state.plants.push(newPlant);
                        state.plants.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    }
                    state.errors.addPlant = null;
                } else {
                    state.errors.addPlant = "Data tanaman tidak valid";
                    console.error("Invalid plant data:", action.payload);
                }
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