import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPlants = createAsyncThunk('plants/fetchPlants', async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    try {
        const response = await axios.get('http://localhost:3000/api/plants', {
            headers: { Authorization: `Bearer ${auth.token}` },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const addPlant = createAsyncThunk('plants/addPlant', async (plantData, { getState, rejectWithValue }) => {
    const { auth } = getState();
    try {
        const response = await axios.post('http://localhost:3000/api/plants', plantData, {
            headers: { Authorization: `Bearer ${auth.token}` },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const plantSlice = createSlice({
    name: 'plants',
    initialState: {
        plants: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlants.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPlants.fulfilled, (state, action) => {
                state.loading = false;
                state.plants = action.payload;
            })
            .addCase(fetchPlants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })
            .addCase(addPlant.fulfilled, (state, action) => {
                state.plants.push(action.payload);
            });
    },
});

export default plantSlice.reducer;