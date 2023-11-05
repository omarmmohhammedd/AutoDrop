import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface userState {
  user: any;
  token: string | null;
}

const initialState: userState = {
  user: null,
  token: null
};

export const userSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    saveUserInfo: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    storeToken(state, action: PayloadAction<any>) {
      state.token = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { saveUserInfo, storeToken } = userSlice.actions;

export default userSlice.reducer;
