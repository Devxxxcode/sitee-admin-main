import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import { persistedReducer } from "./root-reducer";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	REGISTER,
	REHYDRATE,
	PURGE,
} from "redux-persist";
import { requestApi } from "./api/request";

const store = configureStore({
	reducer: persistedReducer,
	devTools: process.env.NODE_ENV !== "production",
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(requestApi.middleware),
});

const persistor = persistStore(store);
export { store, persistor };
