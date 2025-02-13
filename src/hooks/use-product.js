import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const useProducts = () => {
	const {
		data: productData,
		isLoading: isLoadingProduct,
		isError: isErrorProduct,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_PRODUCT,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const products = {
		data: productData?.data,
		isLoading: isLoadingProduct,
		isError: isErrorProduct,
	};

	return {
		products,
	};
};
