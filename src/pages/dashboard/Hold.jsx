import { useState, useMemo, useCallback, useEffect } from "react";
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
import { useHolds } from "../../hooks/use-hold";
import {
	useDeleteRequestMutation,
	usePatchRequestMutation,
	usePostRequestMutation,
} from "../../services/api/request";
import { AiOutlineLoading } from "react-icons/ai";
import { validateForm } from "../../helpers/validate-form";
import { ENDPOINT } from "../../constants/endpoint";
import { invalidateRequestTag } from "../../services/api/invalidate-request-tag";
import { col } from "framer-motion/client";
import { toast } from "sonner";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import { current } from "@reduxjs/toolkit";

const Hold = () => {
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "id",
		direction: "asc",
	});
	const [anchorEl, setAnchorEl] = useState(null);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState("add");
	const [currentRow, setCurrentRow] = useState({
		minimum_amount: "",
		maximum_amount: "",
	});

	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Minimum Amount", accessorKey: "minimum_amount" },
			{ Header: "Maximum Amount", accessorKey: "maximum_amount" },
			{
				Header: "Active",
				accessorKey: "active",
				Cell: ({ value, rowIndex }) => (
					<input
						type="checkbox"
						checked={value}
						onChange={() => handleCheckboxChange(rowIndex)}
					/>
				),
			},
			{
				Header: "Actions",
				accessorKey: "actions",
			},
		],
		[],
	);

	const { onHold } = useHolds();

	useEffect(() => {
		if (onHold?.data) {
			setTableData(
				onHold.data.map((item) => ({
					...item,
					minimum_amount: item?.min_amount,
					maximum_amount: item?.max_amount,
					active: item?.is_active,
				})),
			);
		}
	}, [onHold?.data]);

	const handleCheckboxChange = useCallback((rowId) => {
		setTableData((prevData) =>
			prevData.map((row) =>
				row.id === rowId ? { ...row, active: !row.active } : row,
			),
		);
	}, []);

	const handleSort = useCallback((key) => {
		setSortConfig((prevConfig) => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === "asc"
					? "desc"
					: "asc",
		}));
	}, []);

	const handleColumnToggle = useCallback((key) => {
		setHiddenColumns((prev) =>
			prev.includes(key)
				? prev.filter((col) => col !== key)
				: [...prev, key],
		);
	}, []);

	const handleMenuOpen = useCallback((event) => {
		setAnchorEl(event.currentTarget);
	}, []);

	const handleMenuClose = useCallback(() => {
		setAnchorEl(null);
	}, []);

	const openModal = useCallback((type, row = null) => {
		setModalType(type);
		setCurrentRow(
			type === "add"
				? {
						id: "",
						minimum_amount: "",
						maximum_amount: "",
					}
				: row,
		);
		setIsModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setCurrentRow(null);
	}, []);

	const [postHold, { isLoading: loadingPostHold }] = usePostRequestMutation();
	const [patchHold, { isLoading: loadingPatchHold }] =
		usePatchRequestMutation();
	const isLoadingSubmit = loadingPostHold || loadingPatchHold;
	const handleSubmit = async () => {
		try {
			const formValues = {
				id: currentRow.id,
				min_amount: currentRow.minimum_amount,
				max_amount: currentRow.maximum_amount,
				is_active: currentRow.active,
			};

			if (!validateForm(formValues, ["id", "is_active"])) return;

			if (modalType === "add") {
				const res = await postHold({
					url: ENDPOINT.ADD_ON_HOLD,
					body: formValues,
				}).unwrap();

				toast.success("Hold created successfully");
			} else if (modalType === "update" && currentRow) {
				const res = await patchHold({
					url: ENDPOINT.PATCH_ON_HOLD.replace(":id", formValues.id),
					body: formValues,
				}).unwrap();

				toast.success("Hold updated successfully");
			}

			invalidateRequestTag(ENDPOINT.GET_ON_HOLD);
			closeModal();
		} catch (err) {
			console.error(err);
		}
	};

	const [deleteHold, { isLoading: loadingDeleteHold }] =
		useDeleteRequestMutation();
	const handleDeleteHold = async (id = "") => {
		try {
			await deleteHold({
				url: ENDPOINT.DELETE_HOLD.replace(":id", id),
			}).unwrap();

			toast.success("Hold deleted successfully");
			invalidateRequestTag(ENDPOINT.GET_ON_HOLD);
		} catch (err) {
			console.error(err);
		}
	};

	// Toggle Hold active / inactive
	const [patchToggleHold, { isLoading: loadingToggleHold }] =
		usePatchRequestMutation();
	const handleToggleHoldActive = async (id = "", active) => {
		const confirmToggling = confirm(
			`Are you absolutely sure you want to perform this action?`,
		);

		if (confirmToggling) {
			try {
				await patchToggleHold({
					url: ENDPOINT.PATCH_ON_HOLD.replace(":id", id),
					body: {
						is_active: active ? false : true,
					},
				}).unwrap();

				invalidateRequestTag(ENDPOINT.GET_ON_HOLD);
			} catch (err) {
				console.error(err);
			}
		}
	};

	const handleExportPDF = useCallback(() => {
		const doc = new jsPDF();
		autoTable(doc, {
			head: [columns.map((col) => col.Header)],
			body: tableData.map((row) =>
				columns.map((col) =>
					col.accessorKey === "active"
						? row[col.accessorKey]
							? "Yes"
							: "No"
						: row[col.accessorKey],
				),
			),
		});
		doc.save("on-hold-data.pdf");
	}, [columns, tableData]);

	const handleExportCSV = useCallback(() => {
		const csvData = [
			columns.map((col) => col.Header).join(","),
			...tableData.map((row) =>
				columns
					.map((col) =>
						col.accessorKey === "active"
							? row[col.accessorKey]
								? "Yes"
								: "No"
							: row[col.accessorKey],
					)
					.join(","),
			),
		].join("\n");
		const blob = new Blob([csvData], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "on-hold-data.csv";
		link.click();
	}, [columns, tableData]);

	const handleChangePage = useCallback((_, newPage) => {
		setPage(newPage);
	}, []);

	const handleChangeRowsPerPage = useCallback((event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	}, []);

	const displayedData = useMemo(() => {
		return tableData.slice(
			page * rowsPerPage,
			page * rowsPerPage + rowsPerPage,
		);
	}, [tableData, page, rowsPerPage]);

	if (onHold.isLoading) {
		return <Loading />;
	}

	if (onHold.isError) {
		return <Error />;
	}

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">
					Ranges of on hold
				</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Ranges of on hold</span>
				</nav>
			</div>
			<div className="grid justify-start grid-cols-2 gap-2 mb-4 md:flex">
				<Button
					variant="contained"
					color="warning"
					onClick={handleExportCSV}
					size="small"
				>
					Export CSV
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={handleExportPDF}
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
					{columns.map(
						(col) =>
							col.accessorKey !== "actions" && (
								<MenuItem
									key={col.accessorKey}
									onClick={() => handleColumnToggle(col.accessorKey)}
								>
									{col.Header}
								</MenuItem>
							),
					)}
				</Menu>
				<TextField
					variant="outlined"
					placeholder="Search"
					size="small"
					style={{ marginLeft: "auto" }}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={() => openModal("add")}
				>
					Add
				</Button>
			</div>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							{columns.map(
								(column) =>
									!hiddenColumns.includes(column.accessorKey) && (
										<TableCell key={column.accessorKey}>
											{column.accessorKey !== "actions" ? (
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
											) : (
												column.Header
											)}
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
												{column.accessorKey === "active" ? (
													<span className="flex items-center gap-2">
														{loadingToggleHold &&
															currentRow?.id === row.id && (
																<AiOutlineLoading className="animate-spin" />
															)}

														<input
															type="checkbox"
															disabled={
																loadingToggleHold &&
																currentRow?.id === row.id
															}
															className="custom-checkbox"
															checked={row.active}
															onClick={() => {
																handleToggleHoldActive(
																	row.id,
																	row.active,
																);
																setCurrentRow(row);
															}}
														/>
													</span>
												) : column.accessorKey === "id" ? (
													index + 1
												) : column.accessorKey === "actions" ? (
													<span className="flex items-center gap-2">
														<Button
															variant="contained"
															color="primary"
															size="small"
															disabled={
																currentRow?.id === row.id &&
																loadingDeleteHold
															}
															onClick={() => {
																openModal("update", row);
																setCurrentRow(row);
															}}
														>
															Update
														</Button>

														<Button
															variant="contained"
															color="error"
															size="small"
															disabled={
																currentRow?.id === row.id &&
																loadingDeleteHold
															}
															onClick={() => {
																handleDeleteHold(row.id);
																setCurrentRow(row);
															}}
															sx={{
																gap: "10px",
															}}
														>
															{currentRow?.id === row.id &&
																loadingDeleteHold && (
																	<AiOutlineLoading className="animate-spin" />
																)}{" "}
															Delete
														</Button>
													</span>
												) : column.Cell ? (
													column.Cell({
														value: row[column.accessorKey],
													})
												) : (
													row[column.accessorKey]
												)}
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
					labelRowsPerPage={
						<span style={{ fontSize: "14px", fontWeight: "500" }}>
							Rows per page:
						</span>
					}
					labelDisplayedRows={({ from, to, count }) => (
						<span style={{ fontSize: "14px", fontWeight: "400" }}>
							{`${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
						</span>
					)}
					classes={{
						root: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: "8px 16px",
							fontSize: "14px",
						},
						selectRoot: {
							fontSize: "14px",
							fontWeight: "400",
							marginRight: "8px",
						},
						actions: {
							gap: "8px",
						},
					}}
					style={{
						borderTop: "1px solid #e0e0e0",
						marginTop: "16px",
						fontSize: "14px",
						color: "#333",
					}}
				/>
			</TableContainer>
			<Dialog
				open={isModalOpen}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<span>
							{modalType === "add"
								? "Add a range of on hold"
								: "Update a range of on hold"}
						</span>
						<Button
							onClick={closeModal}
							style={{
								minWidth: "32px",
								height: "10px",
								borderRadius: "50%",
								background: "transparent",
								color: "#000",
								fontSize: "12px",
								lineHeight: "1",
							}}
						>
							&times;
						</Button>
					</div>
				</DialogTitle>

				<DialogContent>
					<TextField
						label="Minimum amount"
						fullWidth
						margin="normal"
						variant="outlined"
						placeholder="Minimum amount"
						value={currentRow?.minimum_amount || ""}
						onChange={(e) =>
							setCurrentRow({
								...currentRow,
								minimum_amount: e.target.value,
							})
						}
					/>
					<TextField
						label="Maximum amount"
						fullWidth
						margin="normal"
						variant="outlined"
						placeholder="Maximum amount"
						value={currentRow?.maximum_amount || ""}
						onChange={(e) =>
							setCurrentRow({
								...currentRow,
								maximum_amount: e.target.value,
							})
						}
					/>
				</DialogContent>
				<DialogActions style={{ padding: "16px" }}>
					<Button
						onClick={closeModal}
						disabled={isLoadingSubmit}
						variant="outlined"
						style={{
							color: "#FFF",
							backgroundColor: "#FF5F15",
							textTransform: "none",
							padding: "6px 16px",
						}}
					>
						Close
					</Button>

					<Button
						onClick={handleSubmit}
						disabled={isLoadingSubmit}
						variant="contained"
						style={{
							backgroundColor: "#1976D2",
							color: "#FFF",
							textTransform: "none",
							padding: "6px 16px",
						}}
					>
						{isLoadingSubmit && (
							<AiOutlineLoading className="animate-spin" />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Hold;
