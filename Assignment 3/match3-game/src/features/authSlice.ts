import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const loginAsync = createAsyncThunk(
  "loginUser",
  async (username, password) => {
    const res = await fetch("localhost:9090/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: {},
});

export const { login, logout } = userSlice.actions;

export const selectUser = (state: any) => state.user.user;

export default userSlice.reducer;
