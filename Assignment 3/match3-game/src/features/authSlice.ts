import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

type User = {
  username: string;
  password: string;
  id: number;
  token: string;
};

type loginState = {
  username: string;
  password: string;
};

type fetchUserState = {
  token: string;
  id: number;
};

type registerUserState = loginState;

const initialUser: User = {
  username: "",
  password: "",
  id: 0,
  token: "",
};

export const loginAsync = createAsyncThunk(
  "user/login",
  //this needs to be only one parameter for it to work (dumb)
  async (state: loginState) => {
    const res = await fetch("http://localhost:9090/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // necessary since state will be of type state: { username, password } instead of {username, password}
      body: JSON.stringify({ ...state }),
    });
    return await res.json();
  }
);

export const getUserAsync = createAsyncThunk(
  "user/getUser",
  async (state: fetchUserState) => {
    const url = `http://localhost:9090/users/${state.id}?token=${state.token}`;
    console.log(url);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return await res.json();
  }
);

export const registerUserAsync = createAsyncThunk(
  "user/registerUser",
  async (state: registerUserState) => {
    const res = await fetch("http://localhost:9090/users", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "post",
      body: JSON.stringify({ ...state }),
    });

    return await res.json();
  }
);

export const logoutUserAsync = createAsyncThunk(
  "user/logoutUser",
  async (token: string) => {
    const url = `http://localhost:9090/logout?token=${token}`;
    const res = await fetch(url, {
      method: "post",
    });

    return res.status;
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: initialUser,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        console.info("loading...", state.user);
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        const { token, userId } = action.payload;
        state.user.token = token;
        state.user.id = userId;
        console.log("successful login", action.payload);
      })
      .addCase(loginAsync.rejected, (_, action) => {
        console.error("error loggin in", action);
      })
      .addCase(getUserAsync.pending, () => {
        console.info("fetching user...");
      })
      .addCase(getUserAsync.fulfilled, (state, action) => {
        const { username, password } = action.payload;
        state.user.username = username;
        state.user.password = password;
        console.log("got user", action.payload);
      })
      .addCase(getUserAsync.rejected, (_, action) => {
        console.error("error fetching user", action);
      })
      .addCase(registerUserAsync.pending, () => {
        console.info("registering user...");
      })
      .addCase(registerUserAsync.fulfilled, () => {
        console.info("registered user successfully");
      })
      .addCase(registerUserAsync.rejected, (_, action) => {
        console.error("error registering user", action);
      })
      .addCase(logoutUserAsync.pending, () => {
        console.info("logging user out...");
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.user = initialUser;
        console.log("logged out successfully");
      })
      .addCase(logoutUserAsync.rejected, (_, action) => {
        console.error("error logging out", action);
      });
  },
});

export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
