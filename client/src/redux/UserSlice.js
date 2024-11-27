import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  user: null,
  currentCourse: null,
};
const UserSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
    },
    setLogOut: (state, action) => {
      localStorage.removeItem("token");
      state.user = null;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload.course;
    },
    updateOnGoing: (state, action) => {
      console.log(state.user);
      (state.user = action.payload.updatedState),
        (state.currentCourse = action.payload.updatedState);
    },
  },
});

export const { setLogin, setLogOut, setCurrentCourse, updateOnGoing } =
  UserSlice.actions;
export default UserSlice.reducer;
