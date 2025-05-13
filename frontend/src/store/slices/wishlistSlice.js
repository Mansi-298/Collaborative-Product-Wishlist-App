import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const createWishlist = createAsyncThunk(
  'wishlist/create',
  async (wishlistData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wishlists`, wishlistData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchWishlists = createAsyncThunk(
  'wishlist/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/wishlists`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchWishlistById = createAsyncThunk(
  'wishlist/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/wishlists/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addProduct = createAsyncThunk(
  'wishlist/addProduct',
  async ({ wishlistId, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/wishlists/${wishlistId}/products`,
        productData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addMember = createAsyncThunk(
  'wishlist/addMember',
  async ({ wishlistId, email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/wishlists/${wishlistId}/members`,
        { email }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteWishlist = createAsyncThunk(
  'wishlist/delete',
  async (wishlistId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/wishlists/${wishlistId}`);
      return { wishlistId };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Network error occurred' });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'wishlist/deleteProduct',
  async ({ wishlistId, productId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/wishlists/${wishlistId}/products/${productId}`
      );
      return {
        wishlistId,
        productId,
        updatedWishlist: response.data
      };
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: 'Network error occurred' });
    }
  }
);

const initialState = {
  wishlists: [],
  currentWishlist: null,
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentWishlist: (state) => {
      state.currentWishlist = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create wishlist
      .addCase(createWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlists.push(action.payload);
      })
      .addCase(createWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Fetch all wishlists
      .addCase(fetchWishlists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlists.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlists = action.payload;
      })
      .addCase(fetchWishlists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Fetch wishlist by id
      .addCase(fetchWishlistById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWishlist = action.payload;
      })
      .addCase(fetchWishlistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWishlist = action.payload;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Add member
      .addCase(addMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWishlist = action.payload;
      })
      .addCase(addMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Delete wishlist
      .addCase(deleteWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlists = state.wishlists.filter(w => w._id !== action.payload.wishlistId);
        if (state.currentWishlist?._id === action.payload.wishlistId) {
          state.currentWishlist = null;
        }
        state.error = null;
      })
      .addCase(deleteWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete wishlist';
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWishlist = action.payload.updatedWishlist;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete product';
      });
  },
});

export const { clearError, clearCurrentWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer; 