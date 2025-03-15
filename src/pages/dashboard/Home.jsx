import Chart from "react-apexcharts";
import { useEffect, useMemo, useState } from "react";
import { useHome } from "../../hooks/use-home";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import moment from "moment";
import {
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TextField,
	TableSortLabel,
	Menu,
	MenuItem,
	TablePagination,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Autocomplete,
} from "@mui/material";

const Home = () => {
	const { analyticsCount } = useHome();
	const cardDataCounts = analyticsCount.data;
	const [search, setSearch] = useState("");
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [page, setPage] = useState(0);

	useEffect(() => {
		if (cardDataCounts?.total_users_login_today?.users) {
			setTableData(
				cardDataCounts?.total_users_login_today?.users.map((item,index) => ({
					...item,
					objectID: item.id,
					id: index+1,
					username: item?.username,
					negative: item?.is_active,
					negativeProducts: item?.number_of_negative_product,
					submitted: item?.total_negative_product_submitted,
					balance: item?.wallet?.balance,
					submissionTotal: `${item?.total_play}/${item?.total_available_play}`,
					profit: item?.wallet?.commission,
					connection: moment(item?.last_connection).format(
						"DD MM YYYY h:mmA",
					),
					onHold: item?.wallet?.on_hold,
				})),
			);
		}
	}, [cardDataCounts?.total_users_login_today?.users]);


	const [sortConfig, setSortConfig] = useState({
		key: "id",
		direction: "asc",
	});
	const filteredData = useMemo(() => {
		// console.log(tableData)
		return tableData.filter((row) =>
			row.username.toLowerCase().includes(search.toLowerCase()),
		);
	}, [search, tableData]);
	const sortedData = useMemo(() => {
		const sorted = [...filteredData];
		if (sortConfig.key) {
			sorted.sort((a, b) => {
				if (a[sortConfig.key] < b[sortConfig.key])
					return sortConfig.direction === "asc" ? -1 : 1;
				if (a[sortConfig.key] > b[sortConfig.key])
					return sortConfig.direction === "asc" ? 1 : -1;
				return 0;
			});
		}
		return sorted;
	}, [filteredData, sortConfig]);
	const displayedData = sortedData.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	const handleSearch = (e) => setSearch(e.target.value);

	const handleChangePage = (event, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Username", accessorKey: "username" },
			// { Header: "Negative", accessorKey: "negative", type: "boolean" },
			// {
			// 	Header: "Number of negative products",
			// 	accessorKey: "negativeProducts",
			// },
			{ Header: "Negative products submitted", accessorKey: "submitted" },
			{ Header: "Balance", accessorKey: "balance" },
			{ Header: "Today’s submission total", accessorKey: "submissionTotal" },
			{ Header: "Today’s profit", accessorKey: "profit" },
			{ Header: "Last Connection", accessorKey: "connection" },
			{ Header: "On Hold", accessorKey: "onHold" },
			// { Header: "Actions", accessorKey: "actions" },
		],
		[],
	);


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
			value: cardDataCounts?.total_users_login_today?.count,
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




			<h1 className="text-2xl font-semibold text-gray-700 mt-5 mb-3">Today Login User</h1>

		
			<TableContainer component={Paper} style={{ overflowX: "scroll" }}>
				<Table>
					<TableHead>
						<TableRow>
							{columns.map(
								(column) =>
									!hiddenColumns.includes(column.accessorKey) && (
										<TableCell key={column.accessorKey}>
											<TableSortLabel
												active={
													sortConfig.key === column.accessorKey
												}
												direction={
													sortConfig.key === column.accessorKey
														? sortConfig.direction
														: "asc"
												}
												onClick={() =>
													handleSort(column.accessorKey)
												}
											>
												{column.Header}
											</TableSortLabel>
										</TableCell>
									),
							)}
						</TableRow>
					</TableHead>

					<TableBody>
						{displayedData.map((row, index) => (
							<TableRow key={row.id}>
								{columns.map(
									(column) =>
										!hiddenColumns.includes(column.accessorKey) && (
											<TableCell key={column.accessorKey}>
												{row[column.accessorKey]}
											</TableCell>
										),
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>

				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={tableData.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>


		</div>
	);
};

export default Home;
