import { createSlice } from "@reduxjs/toolkit";
type Game = {
  score: number;
  completed: boolean;
};

const initialGame: Game = {
  score: 0,
  completed: false,
};

const initialState = {
  game: initialGame,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {},
});

export default gameSlice.reducer;
