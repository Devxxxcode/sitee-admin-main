import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import slices
import userSlice from "./slices/user-slice";
import { requestApi } from "./api/request";

// Persist configuration
const persistConfig = {
	key: "root",
	storage,
	// whitelist: ["userSlice"],
};

const appReducer = combineReducers({
	userSlice,
	[requestApi.reducerPath]: requestApi.reducer,
});

const rootReducer = (state, action) => {
	if (action.type === "RESET_STATE") {
		state = undefined;
	}
	return appReducer(state, action);
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
