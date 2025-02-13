import { useSearchParams } from "react-router-dom";
import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const useAllUsers = () => {
	const [searchParams] = useSearchParams();
	const {
		data: usersData,
		isLoading: loadingUsers,
		isError: errorUsers,
		refetch: refetchUsers,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_ALL_USERS,
			params: {
				ordering_fields: searchParams.get("order"),
			},
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const users = {
		data: usersData?.data,
		isLoading: loadingUsers,
		isError: errorUsers,
	};
	return {
		users,
		refetchUsers,
	};
};
