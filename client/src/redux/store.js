import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import plantReducer from './slices/plantSlice';
import weatherReducer from './slices/weatherSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        plants: plantReducer,
        weather: weatherReducer,
    },
});