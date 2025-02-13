import { useEffect } from "react";
import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const useWithdrawal = () => {
	const { data, isLoading, isError,refetch } = useGetRequestQuery(
		{
			url: ENDPOINT.GET_WITHDRAWALS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	useEffect(() => {
		refetch(); // Force refetch on mount
	}, [refetch]);

	const withdrawals = {
		data: data?.data,
		data: (data?.data || [])
			.slice()
			.map((item, index) => ({ ...item, number: index + 1 })),
		isLoading,
		isError,
	};

	return { withdrawals };
};
