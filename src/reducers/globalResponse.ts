import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface GlobalInterface {
  response: any;
}

const initialState: GlobalInterface = {
  response: null
};

export const globalSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setResponse: (state, action: PayloadAction<any>) => {
      state.response = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { setResponse } = globalSlice.actions;

export default globalSlice.reducer;
