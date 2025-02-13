import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const useNegativeUser = () => {
	const { data, isLoading, isError } = useGetRequestQuery(
		{
			url: ENDPOINT.GET_NEGATIVE_USERS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const users = {
		data: data?.data,
		isLoading,
		isError,
	};

	const {
		data: onHoldData,
		isLoading: loadingOnHold,
		isError: isErrorOnHold,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_ON_HOLD,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const onHold = {
		data: onHoldData?.data || [],
		isLoading: loadingOnHold,
		isError: isErrorOnHold,
	};

	const {
		data: allUsersData,
		isLoading: loadingAllUsers,
		isError: isErrorAllUser,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_ALL_USERS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const allUsers = {
		data: allUsersData?.data || [],
		isLoading: loadingAllUsers,
		isError: isErrorAllUser,
	};

	return { users, onHold, allUsers };
};
