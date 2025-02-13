import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const usePacks = () => {
	const {
		data: packsData,
		isLoading: isLoadingPacks,
		isError: isErrorPacks,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_PACKS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const packs = {
		data: packsData?.data,
		isLoading: isLoadingPacks,
		isError: isErrorPacks,
	};

	// console.log(packs)

	return {
		packs,
	};
};
