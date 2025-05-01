// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';

// Async thunk untuk login dengan Google
export const loginWithGoogle = createAsyncThunk(
    'auth/loginWithGoogle',
    async (googleToken, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/auth/google', { googleToken });
            const { token, user } = response.data;
            if (!token || !user?.userId) {
                throw new Error('Invalid response from server');
            }
            localStorage.setItem('token', token);
            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                'Failed to authenticate with Google';
            return rejectWithValue({ message });
        }
    }
);

// Async thunk untuk memulihkan sesi
export const restoreSession = createAsyncThunk(
    'auth/restoreSession',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) {
            return rejectWithValue({ message: 'No token found' });
        }
        try {
            const response = await api.get('/api/auth/verify');
            const { user } = response.data;
            if (!user?.userId || !user?.email || !user?.name) {
                throw new Error('Invalid user data');
            }
            return { token, user };
        } catch (err) {
            localStorage.removeItem('token');
            const message =
                err.response?.data?.message ||
                err.message ||
                'Session expired';
            return rejectWithValue({ message });
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        loading: false,
        error: null,
        initialized: false,  // flag untuk menandai sesi sudah dicek
    },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            // loginWithGoogle
            .addCase(loginWithGoogle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginWithGoogle.fulfilled, (state, action) => {
                state.loading = false;
                const { token, user } = action.payload;
                state.user = {
                    id: user.userId,
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                };
                state.token = token;
            })
            .addCase(loginWithGoogle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })

            // restoreSession
            .addCase(restoreSession.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.initialized = false;
            })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.loading = false;
                state.initialized = true;
                const { token, user } = action.payload;
                state.user = {
                    id: user.userId,
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                };
                state.token = token;
            })
            .addCase(restoreSession.rejected, (state, action) => {
                state.loading = false;
                state.initialized = true;
                state.user = null;
                state.token = null;
                state.error = action.payload.message;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
