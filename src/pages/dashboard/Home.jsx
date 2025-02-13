import Chart from "react-apexcharts";
import { useMemo } from "react";
import { useHome } from "../../hooks/use-home";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";

const Home = () => {
	const { analyticsCount } = useHome();

	const cardDataCounts = analyticsCount.data;
	const cardData = [
		{ title: "Total Users", value: cardDataCounts?.total_users, icon: "👤" },
		{
			title: "Total Active Products",
			value: cardDataCounts?.active_products,
			icon: "📦",
		},
		{
			title: "Total Submissions Today",
			value: cardDataCounts?.total_submissions,
			icon: "🛒",
		},
		{
			title: "Total User Logins Today",
			value: cardDataCounts?.total_users_login_today,
			icon: "🔑",
		},
	];

	const userChartOptions = {
		chart: { id: "users-chart-static" },
		colors: ["#1E3A8A"],
		xaxis: {
			categories: [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			],
		},
	};

	const submissionChartOptions = {
		chart: { id: "submission-chart-static" },
		colors: ["#1E3A8A"],
		xaxis: {
			categories: [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			],
		},
	};

	const userData = analyticsCount?.data?.user_registrations_per_month || {};
	const userChartData = useMemo(
		() => [{ name: "Users", data: Object.values(userData) }],
		[userData],
	);

	const submissionData =
		analyticsCount?.data?.total_submissions_per_month || {};
	const submissionChartData = useMemo(
		() => [
			{
				name: "Submissions",
				data: Object.values(submissionData),
			},
		],
		[submissionData],
	);

	if (analyticsCount.isLoading) {
		return <Loading />;
	}

	if (analyticsCount.isError) {
		console.error("Error fetching data:", analyticsCount.error);
		return (
			<Error message="An error occurred while fetching data. Please try again later." />
		);
	}

	return (
		<div className="p-2 bg-gray-100 md:p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">Dashboard</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Dashboard</span>
				</nav>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
				{cardData.map((card, index) => (
					<div
						key={index}
						className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md"
					>
						<div>
							<h3 className="font-semibold text-gray-600">
								{card.title}
							</h3>
							<h2 className="text-3xl font-bold text-blue-900">
								{card.value}
							</h2>
						</div>
						<span className="text-4xl">{card.icon}</span>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
				<div className="p-6 bg-white rounded-lg shadow-md">
					<h3 className="mb-4 font-semibold text-gray-600">
						Total Registered Users
					</h3>
					<Chart
						key={userChartData[0].data.join(",")}
						options={userChartOptions}
						series={userChartData}
						type="radar"
						height="350"
					/>
				</div>

				<div className="p-6 bg-white rounded-lg shadow-md">
					<h3 className="mb-4 font-semibold text-gray-600">
						Total Submissions
					</h3>
					<Chart
						key={submissionChartData[0].data.join(",")}
						options={submissionChartOptions}
						series={submissionChartData}
						type="bar"
						height="300"
					/>
				</div>
			</div>
		</div>
	);
};

export default Home;
