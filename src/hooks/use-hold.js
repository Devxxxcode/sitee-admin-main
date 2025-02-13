import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const useHolds = () => {
	const { data, isLoading, isError } = useGetRequestQuery(
		{
			url: ENDPOINT.GET_ON_HOLD,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const onHold = {
		data: data?.data,
		isLoading,
		isError,
	};

	return { onHold };
};
