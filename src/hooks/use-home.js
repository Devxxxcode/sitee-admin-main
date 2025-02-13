import { ENDPOINT } from "../constants/endpoint";
import { useGetRequestQuery } from "../services/api/request";

export const useHome = () => {
	const {
		isLoading: loadingAnalyticsCount,
		data: dashboardAnalyticCount,
		isError: errorDashboardAnalyticCount,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_ADMIN_CREDENTIALS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const analyticsCount = {
		isLoading: loadingAnalyticsCount,
		data: dashboardAnalyticCount?.data?.dashboard,
		isError: errorDashboardAnalyticCount,
	};

	return {
		analyticsCount,
	};
};
