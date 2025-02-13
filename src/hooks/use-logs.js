import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const useLogs = () => {
	const { data, isLoading, isError } = useGetRequestQuery(
		{
			url: ENDPOINT.GET_LOGS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const logs = {
		data: data,
		isLoading,
		isError,
	};

	return { logs };
};
