import { AiOutlineLoading } from "react-icons/ai";
import { useMemo } from "react";
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
} from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import { useDeposit } from "../../hooks/use-deposit";
import moment from "moment";

const Deposits = () => {
	const {
		search,
		setSearch,
		sortConfig,
		setSortConfig,
		anchorEl,
		setAnchorEl,
		hiddenColumns,
		setHiddenColumns,
		page,
		setPage,
		rowsPerPage,
		setRowsPerPage,
		selectedImage,
		setSelectedImage,

		handleDepositStatus,
		isUpdatingeDepositStatus,

		// Deposit Endpoint
		openModal,
		setOpenModal,
		showInputModal,
		setShowInputModal,
		status,

		deposits,
	} = useDeposit();
	console.log(deposits)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const depositsData = deposits.data?.map((item) => ({
		...item,
		dateTime: item?.date_time,
		amount: item?.amount.toLocaleString(),
		user: String(item?.user?.username),
	}));

	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "number" },
			{ Header: "User", accessorKey: "user" },
			{ Header: "Amount", accessorKey: "amount" },
			{ Header: "Date time", accessorKey: "dateTime" },
			{ Header: "Status", accessorKey: "status" },
			{ Header: "Screenshot", accessorKey: "screenshot" },
			{ Header: "Actions", accessorKey: "actions" },
		],
		[],
	);

	const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);

	const handleColumnToggle = (key) => {
		setHiddenColumns((prev) =>
			prev.includes(key)
				? prev.filter((col) => col !== key)
				: [...prev, key],
		);
	};

	const handleSort = (key) => {
		setSortConfig((prev) => ({
			key,
			direction:
				prev.key === key && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const handleSearch = (e) => setSearch(e.target.value);

	const handleChangePage = (event, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	const handleExportPDF = () => {
		const doc = new jsPDF();
		autoTable(doc, {
			head: [columns.map((col) => col.Header)],
			body: depositsData.map((row) =>
				columns.map((col) => row[col.accessorKey]),
			),
		});
		doc.save("deposits.pdf");
	};

	const handleExportCSV = () => {
		const csvData = [
			columns.map((col) => col.Header).join(","),
			...depositsData.map((row) =>
				columns.map((col) => row[col.accessorKey]).join(","),
			),
		].join("\n");
		const blob = new Blob([csvData], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "deposits.csv";
		link.click();
	};

	const filteredData = useMemo(() => {
		return depositsData.filter((row) =>
			row.user.toLowerCase().includes(search.toLowerCase()),
		);
	}, [search, depositsData]);

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

	// Loading Page
	if (deposits.isLoading) {
		return <Loading />;
	}

	// Error getting request
	if (deposits.isError) {
		return <Error />;
	}

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">
					Deposits List
				</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Deposits List</span>
				</nav>
			</div>
			<div className="grid justify-start grid-cols-2 gap-2 mb-4 md:flex">
				<Button
					variant="contained"
					onClick={handleExportCSV}
					color="warning"
					size="small"
				>
					Export CSV
				</Button>
				<Button
					variant="contained"
					onClick={handleExportPDF}
					color="error"
					size="small"
				>
					Export PDF
				</Button>
				<Button
					variant="contained"
					color="info"
					size="small"
					onClick={handleMenuOpen}
				>
					Column Visibility
				</Button>

				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
				>
					{columns.map((col) => (
						<MenuItem
							key={col.accessorKey}
							onClick={() => handleColumnToggle(col.accessorKey)}
						>
							{col.Header}
						</MenuItem>
					))}
				</Menu>

				<TextField
					variant="outlined"
					placeholder="Search"
					size="small"
					style={{ marginLeft: "auto" }}
					value={search}
					onChange={handleSearch}
				/>
			</div>

			{/* Button to close the dropdown anywhere outside the dropddown */}
			{Object.keys(openModal).length > 0 && (
				<button
					id="close-dropdown"
					onClick={() => openModal({})}
					className="absolute w-screen h-screen"
				/>
			)}

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{columns.map(
								(col) =>
									!hiddenColumns.includes(col.accessorKey) && (
										<TableCell key={col.accessorKey}>
											<TableSortLabel
												active={sortConfig.key === col.accessorKey}
												direction={
													sortConfig.key === col.accessorKey
														? sortConfig.direction
														: "asc"
												}
												onClick={() => handleSort(col.accessorKey)}
											>
												{col.Header}
											</TableSortLabel>
										</TableCell>
									),
							)}
						</TableRow>
					</TableHead>

					<TableBody>
						{displayedData.map((row) => (
							<TableRow key={row.id}>
								{columns.map((col) =>
									!hiddenColumns.includes(col.accessorKey) ? (
										<TableCell key={col.accessorKey}>
											{col.accessorKey === "screenshot" ? (
												<img
													src={row[col.accessorKey]}
													alt={`Screenshot ${row.id}`}
													className="object-cover w-auto h-12 cursor-pointer"
													onClick={() =>
														setSelectedImage(row[col.accessorKey])
													}
												/>
											) : col.accessorKey === "actions" ? (
												<span className="relative">
													<Button
														variant="contained"
														color="primary"
														onClick={() => {
															setOpenModal(row);
															// setStatus;
														}}
													>
														See More
													</Button>
												</span>
											) : (
												row[col.accessorKey]
											)}
										</TableCell>
									) : null,
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={depositsData.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>

			{/* Deposit Se */}
			<Dialog
				open={showInputModal.open}
				onClose={() =>
					setShowInputModal((prev) => ({
						...prev,
						open: !prev.open,
					}))
				}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Authorization</DialogTitle>

				<DialogContent className="grid">
					<TextField
						label="Administrator Password"
						margin="dense"
						value={showInputModal.admin_password}
						onChange={(e) =>
							setShowInputModal((prev) => ({
								...prev,
								admin_password: e.target.value,
							}))
						}
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={() =>
							setShowInputModal((prev) => ({
								...prev,
								open: !prev.open,
								admin_password: "",
							}))
						}
						variant="contained"
						color="error"
					>
						Close
					</Button>

					<Button
						className="flex items-center gap-2"
						onClick={() => handleDepositStatus()}
						disabled={isUpdatingeDepositStatus}
						variant="contained"
					>
						{isUpdatingeDepositStatus && (
							<AiOutlineLoading className="animate-spin" />
						)}
						Submit
					</Button>
				</DialogActions>
			</Dialog>

			{/* Deposit See More Modal */}
			<Dialog
				open={Boolean(Object.keys(openModal).length)}
				onClose={() => setOpenModal({})}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update Deposit Status</DialogTitle>

				<DialogContent className="grid grid-cols-2 gap-y-4">
					<p>
						User Name: <b>{openModal.user}</b>
					</p>

					<p>
						Amount: <b>{openModal.amount}</b>
					</p>

					<p>
						Status: <b>{openModal.status}</b>
					</p>

					<p>
						Date:{" "}
						<b>
							{moment(openModal.date_time).format("DD MMM YYYY h:mm A")}
						</b>
					</p>

					<div className="col-span-2 space-y-2">
						<p>Screenshot:</p>

						<img src={openModal.screenshot} />
					</div>
				</DialogContent>

				{openModal.status &&
					openModal.status.toLowerCase() === "pending" && (
						<DialogActions>
							<Button
								onClick={() => {
									setShowInputModal((prev) => ({
										...prev,
										open: true,
										actionStatus: "Confirmed",
									}));
								}}
								variant="contained"
								className="gap-2"
							>
								Validate Deposit
							</Button>

							<Button
								onClick={() => {
									setShowInputModal((prev) => ({
										...prev,
										open: true,
										actionStatus: "Rejected",
									}));
								}}
								variant="contained"
								color="error"
								className="gap-2"
							>
								Cancel Deposit
							</Button>
						</DialogActions>
					)}
			</Dialog>

			{/*  ScreenShot Preview */}
			<Dialog
				open={Boolean(selectedImage)}
				onClose={() => setSelectedImage(null)}
			>
				<DialogTitle>Screenshot Preview</DialogTitle>
				<DialogContent>
					<img
						src={selectedImage}
						alt="Screenshot Preview"
						className="w-full h-full"
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Deposits;
