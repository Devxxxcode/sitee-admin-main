import { useState, useMemo, useEffect } from "react";
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
} from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { useWithdrawal } from "../../hooks/use-withdrawal";
import moment from "moment";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import { usePatchRequestMutation } from "../../services/api/request";
import { ENDPOINT } from "../../constants/endpoint";
import { AiOutlineLoading } from "react-icons/ai";
import { invalidateRequestTag } from "../../services/api/invalidate-request-tag";

const Withdrawals = () => {
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "number",
		direction: "asc",
	});
	const [columnAnchorEl, setColumnAnchorEl] = useState(null);
	const [unrollAnchorEl, setUnrollAnchorEl] = useState(null);
	const [dropdownRow, setDropdownRow] = useState(null);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [tableData, setTableData] = useState([]);
	const { withdrawals } = useWithdrawal();

	// console.log(withdrawals)

	useEffect(() => {
		if (withdrawals?.data) {
			const newData = withdrawals.data.map((item) => ({
				...item,
				user: item?.user?.username,
				created_at: moment(item?.created_at).format("DD MMM YYYY h:mm A"),
			}));

			setTableData(newData);
		}
	}, [withdrawals?.data]);

	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "number" },
			{ Header: "User", accessorKey: "user" },
			{ Header: "Amount", accessorKey: "amount" },
			{ Header: "Status", accessorKey: "status" },
			{ Header: "Created At", accessorKey: "created_at" },
			{ Header: "Actions", accessorKey: "actions" },
		],
		[],
	);

	const handleColumnMenuOpen = (event) =>
		setColumnAnchorEl(event.currentTarget);
	const handleColumnMenuClose = () => setColumnAnchorEl(null);

	const handleUnrollMenuOpen = (event, row) => {
		setUnrollAnchorEl(event.currentTarget);
		setDropdownRow(row);
	};

	const handleUnrollMenuClose = () => {
		setUnrollAnchorEl(null);
		setDropdownRow(null);
	};

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

	const [statusUpdate, setStatusUpdate] = useState({
		action: "",
		id: "",
	});

	const [patchWithdrawal, { isLoading: patchingWithdrawal }] =
		usePatchRequestMutation();
	const handleAction = async (id = "", action = "") => {
		try {
			const res = await patchWithdrawal({
				url: ENDPOINT.UPDATE_WITHDRAWAL.replace(":id", id),
				body: {
					status: action,
				},
			}).unwrap();

			invalidateRequestTag(ENDPOINT.GET_WITHDRAWALS);
			setStatusUpdate({
				action: "",
				id: "",
			});
		} catch (err) {
			console.error(err);
		}
		handleUnrollMenuClose();
	};

	const handleExportPDF = () => {
		const doc = new jsPDF();
		autoTable(doc, {
			head: [columns.map((col) => col.Header)],
			body: tableData.map((row) =>
				columns.map((col) => {
					return row[col.accessorKey];
				}),
			),
		});
		doc.save("withdrawals.pdf");
	};

	const handleExportCSV = () => {
		const csvData = [
			columns.map((col) => col.Header).join(","),
			...tableData.map((row) =>
				columns
					.map((col) => {
						if (col.accessorKey === "screenshot") {
							return "Screenshot"; // Replace image data with a label
						}
						return row[col.accessorKey];
					})
					.join(","),
			),
		].join("\n");
		const blob = new Blob([csvData], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "withdrawals.csv";
		link.click();
	};

	const filteredData = useMemo(() => {
		return tableData.filter(
			(row) => row && row?.user.toLowerCase().includes(search.toLowerCase()),
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

	if (withdrawals.isLoading) {
		return <Loading />;
	}

	if (withdrawals.isError) {
		return <Error />;
	}

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">
					Withdrawal List
				</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Withdrawal List</span>
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
					onClick={handleColumnMenuOpen}
				>
					Column Visibility
				</Button>
				<Menu
					anchorEl={columnAnchorEl}
					open={Boolean(columnAnchorEl)}
					onClose={handleColumnMenuClose}
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
													className="object-cover w-auto h-12"
												/>
											) : col.accessorKey === "actions" ? (
												!row?.is_reviewed && (
													<>
														<Button
															variant="contained"
															size="small"
															color="primary"
															onClick={(e) =>
																handleUnrollMenuOpen(e, row)
															}
														>
															Unroll
														</Button>

														<Menu
															anchorEl={unrollAnchorEl}
															open={dropdownRow?.id === row.id}
															onClose={handleUnrollMenuClose}
														>
															<MenuItem
																sx={{
																	gap: "10px",
																}}
																disabled={
																	patchingWithdrawal &&
																	statusUpdate.id === row.id
																}
																onClick={() => {
																	setStatusUpdate({
																		action: "Processed",
																		id: row.id,
																	});
																	handleAction(
																		row.id,
																		"Processed",
																	);
																}}
															>
																{patchingWithdrawal &&
																	statusUpdate.id === row.id &&
																	statusUpdate.action ===
																		"Processed" && (
																		<AiOutlineLoading className="animate-spin" />
																	)}
																Validate Withdrawal
															</MenuItem>

															<MenuItem
																sx={{
																	gap: "10px",
																}}
																disabled={
																	patchingWithdrawal &&
																	statusUpdate.id === row.id
																}
																onClick={() => {
																	setStatusUpdate({
																		action: "Rejected",
																		id: row.id,
																	});
																	handleAction(
																		row.id,
																		"Rejected",
																	);
																}}
															>
																{patchingWithdrawal &&
																	statusUpdate.id === row.id &&
																	statusUpdate.action ===
																		"Rejected" && (
																		<AiOutlineLoading className="animate-spin" />
																	)}
																Cancel Withdrawal
															</MenuItem>
														</Menu>
													</>
												)
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

export default Withdrawals;
