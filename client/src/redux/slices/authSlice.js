// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../helpers/api';

// Async thunk untuk register dengan email dan password
export const register = createAsyncThunk(
    'auth/register',
    async ({ email, password, name }, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/auth/register', { email, password, name });
            const { token, user } = response.data;
            if (!token || !user?.userId) {
                throw new Error('Invalid response from server');
            }
            localStorage.setItem('token', token);
            return response.data;
        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.pesan === "Kesalahan validasi") {
                const errorMessages = err.response.data.errors;
                const message = Object.values(errorMessages).join(', ');
                return rejectWithValue({ message });
            }
            const message =
                err.response?.data?.message ||
                err.message ||
                'Failed to register';
            return rejectWithValue({ message });
        }
    }
);

// Async thunk untuk login dengan email dan password
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
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
                'Failed to login';
            return rejectWithValue({ message });
        }
    }
);

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
            return rejectWithValue({ message: null });
        }
        try {
            const response = await api.get('/api/auth/session');
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
        initialized: false,
        isLoggingOut: false,
        isUpdatingProfile: false, // Tambahkan state ini
    },
    reducers: {
        logout(state) {
            state.isLoggingOut = true;
            state.user = null;
            state.token = null;
            state.error = null;
            state.initialized = true;
            localStorage.removeItem('token');
            state.isLoggingOut = false;
        },
        startUpdatingProfile(state) { // Tambahkan aksi untuk menandai mulai pembaruan
            state.isUpdatingProfile = true;
        },
        finishUpdatingProfile(state) { // Tambahkan aksi untuk menandai selesai pembaruan
            state.isUpdatingProfile = false;
        },
        updateProfile(state, action) { // Tambahkan aksi untuk memperbarui profil
            const { user, token } = action.payload;
            state.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
            };
            state.token = token;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
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
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })

            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
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
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })

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

export const { logout, startUpdatingProfile, finishUpdatingProfile, updateProfile } = authSlice.actions;
export default authSlice.reducer;