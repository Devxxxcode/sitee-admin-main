import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	user: {
		refresh_token: "",
		access_token: "",
		username: "",
		first_name: "",
		last_name: "",
		phone_number: "",
		email: "",
		profile_picture: null,
	},
	sessionExpired: true,
};

const userSlice = createSlice({
	name: "userSlice",
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
			state.sessionExpired = false;
		},
		setSessionExpired: (state, action) => {
			state.sessionExpired = action.payload;
		},
		clearAccessToken: (state) => {
			state.user.access_token = "";
		},
	},
});

export const { setSessionExpired, setUser, clearAccessToken } =
	userSlice.actions;
export default userSlice.reducer;
