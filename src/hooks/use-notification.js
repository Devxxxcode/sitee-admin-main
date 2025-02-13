import { toast } from "sonner";
import { ENDPOINT } from "../constants/endpoint";
import {
	useGetRequestQuery,
	usePostRequestMutation,
} from "../services/api/request";
import { invalidateRequestTag } from "../services/api/invalidate-request-tag";

export const useNotification = () => {
	const { data, isLoading, isError } = useGetRequestQuery(
		{
			url: ENDPOINT.GET_NOTIFICATIONS,
		},
		{
			pollingInterval: 30000,
		},
	);

	const notifications = {
		data: data?.data,
		isLoading,
		isError,
	};

	const [postMarkAll, { isLoading: markingAllAsRead }] =
		usePostRequestMutation();
	const handleMarkAllAsRead = async () => {
		try {
			const res = await postMarkAll({
				url: ENDPOINT.POST_MARK_ALL_NOTIFICATION_AS_READ,
				body: {},
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_NOTIFICATIONS);
		} catch (err) {
			console.error(err);
		}
	};

	const [postMark, { isLoading: markingAsRead }] = usePostRequestMutation();
	const handleMarkAsRead = async (id = "") => {
		try {
			const res = await postMark({
				url: ENDPOINT.POST_MARK_SINGLE_NOTIFICATION,
				body: {
					notification_id: id,
				},
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_NOTIFICATIONS);
		} catch (err) {
			console.error(err);
		}
	};

	return {
		notifications,
		handleMarkAllAsRead,
		markingAllAsRead,
		handleMarkAsRead,
		markingAsRead,
	};
};
