import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';

export const fetchWeather = createAsyncThunk('weather/fetchWeather', async ({ lat, lon }, { rejectWithValue }) => {
    try {
        const response = await api.get(`/api/weather?lat=${lat}&lon=${lon}`);
        return response.data;
    } catch (error) {
        console.log("🚀 ~ fetchWeather ~ error:", error);
        return rejectWithValue({});
    }
});

const weatherSlice = createSlice({
    name: 'weather',
    initialState: {
        weather: null,
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWeather.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWeather.fulfilled, (state, action) => {
                state.loading = false;
                state.weather = action.payload;
            })
            .addCase(fetchWeather.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            });
    },
});

export default weatherSlice.reducer;