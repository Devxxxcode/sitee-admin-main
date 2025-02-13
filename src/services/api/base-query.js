import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import qs from "qs";
import { getEnv } from "../../helpers/get-env";
import { ENDPOINT } from "../../constants/endpoint";
import {
	clearAccessToken,
	setSessionExpired,
	setUser,
} from "../slices/user-slice";

// export const baseServerUrl = getEnv(
// 	"VITE_API_BASE_URL",
// 	"https://ads-backend-4ho2.onrender.com"
// );

export const baseServerUrl = "https://ads-backend-4ho2.onrender.com"

const baseQuery = fetchBaseQuery({
	baseUrl: baseServerUrl,

	prepareHeaders: (headers, { getState, body }) => {
		headers.set("accept", "application/json");

		if (body instanceof FormData) {
			// Do nothing here, FormData automatically handles its own Content-Type
		} else {
			const state = getState();
			const { user } = state.userSlice;
			const token = user?.access_token;

			if (token && !headers.has("Authorization")) {
				headers.set("Authorization", `Bearer ${token}`);
			}
		}
		return headers;
	},
	paramsSerializer: (params) => qs.stringify(params),
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
	let result = await baseQuery(args, api, extraOptions);

	// Check for unauthorized response (token expired or invalid)
	const isUnauthorizedResponse =
		result.error &&
		(result?.error?.status === 401 ||
			result?.error?.status === 419 ||
			result?.error?.status === 403);

	if (isUnauthorizedResponse) {
		// Remove old access token
		api.dispatch(clearAccessToken());

		// Get the refresh token from state
		const refreshToken = api.getState().userSlice?.user?.refresh_token;

		if (!refreshToken) {
			// No refresh token available, log out the user and reset state
			api.dispatch(setSessionExpired(true));
			api.dispatch({ type: "RESET_STATE" });
			return result;
		}

		// Make a request to refresh the access token
		const refreshResult = await baseQuery(
			{
				url: ENDPOINT.GET_REFRESHED_ACCESS_TOKEN,
				method: "POST",
				body: { refresh: refreshToken },
			},
			api,
			extraOptions,
		);

		if (refreshResult?.data) {
			// Successfully refreshed the token
			const user = api.getState().userSlice.user;

			// Update the state with the new access token
			api.dispatch(
				setUser({
					...user,
					access_token: refreshResult.data?.data?.access,
					refresh_token: refreshResult.data?.data?.refresh,
				}),
			);

			// Retry the original query with the new access token
			result = await baseQuery(args, api, extraOptions);
		} else {
			// Failed to refresh, log out the user
			api.dispatch(setSessionExpired(true));
			api.dispatch({ type: "RESET_STATE" });
		}
	}

	return result;
};
