import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./base-query";
import { transformErrorResponse } from "../../helpers/transform-rtk-error";

export const requestApi = createApi({
	baseQuery: baseQueryWithReauth,
	reducerPath: "requestApi",
	tagTypes: ["Data"],

	endpoints: (builder) => ({
		getRequest: builder.query({
			query: ({ url, params }) => ({
				url,
				method: "GET",
				params,
			}),
			transformErrorResponse,
			providesTags: (_result, _error, { url }) => [
				{ type: "Data", id: url },
			],
		}),
		postRequest: builder.mutation({
			query: ({ url, body }) => ({
				url,
				method: "POST",
				body,
			}),
			transformErrorResponse,
			invalidatesTags: (_result, _error, { url }) => [
				{ type: "Data", id: url },
			],
		}),
		putRequest: builder.mutation({
			query: ({ url, body, params }) => ({
				url,
				method: "PUT",
				body,
				params,
			}),
			transformErrorResponse,
			invalidatesTags: (_result, _error, { url }) => [
				{ type: "Data", id: url },
			],
		}),
		deleteRequest: builder.mutation({
			query: ({ url, params }) => ({
				url,
				method: "DELETE",
				params,
			}),
			transformErrorResponse,
			invalidatesTags: (_result, _error, { url }) => [
				{ type: "Data", id: url },
			],
		}),

		patchRequest: builder.mutation({
			query: ({ url, body, params }) => ({
				url,
				method: "PATCH",
				body,
				params,
			}),
			transformErrorResponse,
			invalidatesTags: (_result, _error, { url }) => [
				{ type: "Data", id: url },
			],
		}),
	}),
});

export const {
	useGetRequestQuery,
	usePostRequestMutation,
	usePutRequestMutation,
	useDeleteRequestMutation,
	usePatchRequestMutation,
} = requestApi;

export default requestApi;
