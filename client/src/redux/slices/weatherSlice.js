import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchWeather = createAsyncThunk('weather/fetchWeather', async (city, { getState, rejectWithValue }) => {
    const { auth } = getState();
    try {
        const response = await axios.get(`http://localhost:3000/api/weather?city=${city}`, {
            headers: { Authorization: `Bearer ${auth.token}` },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
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