import requestApi from "./request";
import { store } from "../store";

export const invalidateRequestTag = (endpoint = "") => {
	store.dispatch(
		requestApi.util.invalidateTags([{ type: "Data", id: endpoint }]),
	);
};
