import { useState, useMemo, useEffect, useCallback } from "react";
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
	Checkbox,
} from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { usePacks } from "../../hooks/use-packs";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import {
	usePostRequestMutation,
	usePatchRequestMutation,
} from "../../services/api/request";
import { ENDPOINT } from "../../constants/endpoint";
import { validateForm } from "../../helpers/validate-form";
import { convertToFormData } from "../../helpers/convert-to-form-data";
import { toast } from "sonner";
import { invalidateRequestTag } from "../../services/api/invalidate-request-tag";
import { AiOutlineLoading } from "react-icons/ai";

const Packs = () => {
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "id",
		direction: "asc",
	});
	const [anchorEl, setAnchorEl] = useState(null);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentRow, setCurrentRow] = useState({
		id: "",
		name: "",
		usd_value: "",
		payment_bonus: "",
		daily_missions: "",
		description: "",
		short_description: "",
		daily_withdrawals: "",
		icon: null,
		created_by: "",
		is_active: true,
		profit_percentage: "",
		payment_limit_to_trigger_bonus: "",
		payment_bonus: "",
		number_of_set: "",
	});
	const [modalType, setModalType] = useState("add");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [tableData, setTableData] = useState([]);

	// Memoized columns
	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Name", accessorKey: "name" },
			{ Header: "Usd value", accessorKey: "usd_value" },
			{ Header: "Payment Bonus", accessorKey: "payment_bonus" },
			{
				Header: "Payment to Unlock Bonus",
				accessorKey: "payment_limit_to_trigger_bonus",
			},
			{ Header: "Daily missions", accessorKey: "daily_missions" },
			{ Header: "Daily withdrawals", accessorKey: "daily_withdrawals" },
			{ Header: "Short Description", accessorKey: "short_description" },
			{ Header: "Icon", accessorKey: "icon" },
			{ Header: "Created by", accessorKey: "created_by" },
			{ Header: "Profit Percentage", accessorKey: "profit_percentage" },
			{ Header: "Active", accessorKey: "is_active", type: "boolean" },
			{ Header: "Actions", accessorKey: "actions" },
		],
		[],
	);

	// Memoized table data update
	const { packs } = usePacks();
	useEffect(() => {
		if (packs?.data) {
			setTableData(
				packs?.data.map((item) => ({
					...item,
					usd_value: item?.usd_value.toLocaleString(),
					created_by: item?.created_by?.username,
					payment_limit_to_trigger_bonus:
						item?.payment_limit_to_trigger_bonus,
				})),
			);
		}
	}, [packs?.data]);

	// Handlers wrapped in useCallback to avoid re-creation
	const handleMenuOpen = useCallback(
		(event) => setAnchorEl(event.currentTarget),
		[],
	);
	const handleMenuClose = useCallback(() => setAnchorEl(null), []);
	const handleColumnToggle = useCallback((key) => {
		setHiddenColumns((prev) =>
			prev.includes(key)
				? prev.filter((col) => col !== key)
				: [...prev, key],
		);
	}, []);
	const handleSort = useCallback((key) => {
		setSortConfig((prev) => ({
			key,
			direction:
				prev.key === key && prev.direction === "asc" ? "desc" : "asc",
		}));
	}, []);
	const handleSearch = useCallback((e) => setSearch(e.target.value), []);
	const handleChangePage = useCallback(
		(event, newPage) => setPage(newPage),
		[],
	);
	const handleChangeRowsPerPage = useCallback((event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	}, []);
	const handleCheckboxToggle = useCallback((id) => {
		setTableData((prev) =>
			prev.map((row) =>
				row.id === id ? { ...row, is_active: !row.is_active } : row,
			),
		);
	}, []);

	// Modal handlers
	const openModal = useCallback((type, row = {}) => {
		setModalType(type);
		setCurrentRow(
			type === "update"
				? row
				: {
						id: "",
						name: "",
						usd_value: "",
						payment_bonus: "",
						daily_missions: "",
						description: "",
						short_description: "",
						daily_withdrawals: "",
						icon: null,
						created_by: "",
						is_active: true,
						profit_percentage: "",
						payment_limit_to_trigger_bonus: "",
						payment_bonus: "",
						number_of_set: "",
					},
		);
		setIsModalOpen(true);
	}, []);
	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setCurrentRow({
			id: "",
			name: "",
			usd_value: "",
			payment_bonus: "",
			daily_missions: "",
			description: "",
			short_description: "",
			daily_withdrawals: "",
			icon: null,
			created_by: "",
			is_active: true,
			profit_percentage: "",
			payment_limit_to_trigger_bonus: "",
			payment_bonus: "",
			number_of_set: "",
		});
	}, []);

	// Export functions
	const handleExportPDF = useCallback(() => {
		const doc = new jsPDF();
		autoTable(doc, {
			head: [columns.map((col) => col.Header)],
			body: tableData.map((row) =>
				columns.map((col) => row[col.accessorKey]),
			),
		});
		doc.save("packages.pdf");
	}, [columns, tableData]);

	const handleExportCSV = useCallback(() => {
		const csvData = [
			columns.map((col) => col.Header).join(","),
			...tableData.map((row) =>
				columns.map((col) => row[col.accessorKey]).join(","),
			),
		].join("\n");
		const blob = new Blob([csvData], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "packages.csv";
		link.click();
	}, [columns, tableData]);

	// Form submission
	const [postPacks, { isLoading: isPostingPacks }] = usePostRequestMutation();
	const [patchPacks, { isLoading: isUpdatingPacks }] =
		usePatchRequestMutation();

	const isSubmittingForm = isPostingPacks || isUpdatingPacks;
	const handlePacksSubmit = useCallback(async () => {
		try {
			if (!validateForm(currentRow, ["is_active", "created_by", "id"]))
				return;

			const formData = convertToFormData(currentRow, ["icon"]);

			if (modalType === "add") {
				await postPacks({
					url: ENDPOINT.ADD_PACKS,
					body: formData,
				}).unwrap();

				toast.success("Pack added successfully");
			} else {
				await patchPacks({
					url: ENDPOINT.PATCH_PACKS.replace(":id", currentRow.id),
					body: formData,
				}).unwrap();

				toast.success("Pack updated successfully");
			}

			invalidateRequestTag(ENDPOINT.GET_PACKS);
			closeModal();
		} catch (error) {
			console.error(error);
		}
	}, [currentRow, modalType, postPacks, patchPacks, closeModal]);

	// Prevent unnecessary renders
	const filteredData = useMemo(() => {
		return tableData.filter((row) =>
			row.name.toLowerCase().includes(search.toLowerCase()),
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

	const displayedData = useMemo(
		() =>
			sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[sortedData, page, rowsPerPage],
	);

	const [patchPacksActive, { isLoading: isDeletingPacks }] =
		usePatchRequestMutation();

	const handlePackDelete = async (id = "", isActive) => {
		try {
			const formData = convertToFormData({
				is_active: isActive ? false : true,
			});

			await patchPacksActive({
				url: ENDPOINT.PATCH_PACKS.replace(":id", id),
				body: formData,
			}).unwrap();

			invalidateRequestTag(ENDPOINT.GET_PACKS);
		} catch (err) {
			console.error(err);
		}
	};

	if (packs.isLoading) return <Loading />;
	if (packs.isError) return <Error />;

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">
					Packages List
				</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Packages List</span>
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
				<Button
					variant="contained"
					onClick={() => openModal("add")}
					size="small"
					color="primary"
				>
					Add a Package
				</Button>
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
												is_active={
													sortConfig.key === col.accessorKey
												}
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
						{displayedData.map((row, index) => (
							<TableRow key={row.id}>
								{columns.map(
									(col) =>
										!hiddenColumns.includes(col.accessorKey) && (
											<TableCell key={col.accessorKey}>
												{col.accessorKey === "id" ? (
													index + 1
												) : col.accessorKey === "icon" ? (
													<img
														src={
															row.icon instanceof File
																? URL.createObjectURL(row.icon)
																: row.icon
														}
														alt={`${row.name} Icon`}
														className="object-cover w-8 h-8 border rounded"
													/>
												) : col.accessorKey === "is_active" ? (
													<Checkbox
														checked={row.is_active}
														onChange={() =>
															handleCheckboxToggle(row.id)
														}
													/>
												) : col.accessorKey === "actions" ? (
													<span className="flex items-center gap-2">
														<Button
															variant="contained"
															color="secondary"
															size="small"
															onClick={() =>
																openModal("update", row)
															}
														>
															Update
														</Button>

														<Button
															variant="contained"
															color="error"
															size="small"
															disabled={
																isDeletingPacks &&
																currentRow.id === row.id
															}
															onClick={() => {
																setCurrentRow(row);
																handlePackDelete(
																	row.id,
																	row.is_active,
																);
															}}
															className="gap-2"
														>
															{isDeletingPacks &&
																currentRow.id === row.id && (
																	<AiOutlineLoading className="animate-spin" />
																)}

															{row.is_active
																? "Deactivate"
																: "Activate"}
														</Button>
													</span>
												) : (
													row[col.accessorKey]
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
				/>
			</TableContainer>

			<Dialog
				open={isModalOpen}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					{modalType === "add" ? "Add a Package" : "Update Package"}
				</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-2 gap-4">
						<TextField
							label="Name"
							fullWidth
							margin="normal"
							variant="outlined"
							value={currentRow.name || ""}
							onChange={(e) =>
								setCurrentRow({ ...currentRow, name: e.target.value })
							}
						/>
						<TextField
							label="Usd Value"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.usd_value || ""}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									usd_value: e.target.value,
								})
							}
						/>
						<TextField
							label="Extra Bonus (USD)"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.payment_bonus || ""}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									payment_bonus: e.target.value,
								})
							}
						/>
						<TextField
							label="Daily Missions"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.daily_missions || ""}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									daily_missions: e.target.value,
								})
							}
						/>
						<TextField
							label="Daily Withdrawals"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.daily_withdrawals || ""}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									daily_withdrawals: e.target.value,
								})
							}
						/>

						<TextField
							label="Payment Amount to Unlock Bonus"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.payment_limit_to_trigger_bonus}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									payment_limit_to_trigger_bonus: e.target.value,
								})
							}
						/>

						<TextField
							label="Payment Bonus"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.payment_bonus}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									payment_bonus: e.target.value,
								})
							}
						/>

						<TextField
							label="Number of Set"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.number_of_set}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									number_of_set: e.target.value,
								})
							}
						/>

						<TextField
							label="Profit Percentage"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.profit_percentage}
							className="col-span-2"
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									profit_percentage: e.target.value,
								})
							}
						/>

						<TextField
							label="Short Description"
							fullWidth
							margin="normal"
							variant="outlined"
							multiline
							rows={2}
							value={currentRow.short_description || ""}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									short_description: e.target.value,
								})
							}
							className="col-span-2"
						/>
						<TextField
							label="Description"
							fullWidth
							margin="normal"
							variant="outlined"
							multiline
							rows={2}
							value={currentRow.description || ""}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									description: e.target.value,
								})
							}
							className="col-span-2"
						/>
						<div className="flex items-center space-x-4">
							<label htmlFor="icon-upload" className="block">
								<Button variant="outlined" component="label">
									Choose File
									<input
										type="file"
										hidden
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files[0];

											setCurrentRow({
												...currentRow,
												icon: file,
											});
										}}
									/>
								</Button>
							</label>
							{currentRow.icon ? (
								<img
									src={
										currentRow.icon instanceof File
											? URL.createObjectURL(currentRow.icon)
											: currentRow.icon
									}
									alt="Icon"
									className="object-cover w-12 h-12 border rounded"
								/>
							) : (
								<span className="ml-2 text-sm">No file chosen</span>
							)}
							<Checkbox
								checked={currentRow.is_active}
								onChange={(e) =>
									setCurrentRow({
										...currentRow,
										is_active: e.target.checked,
									})
								}
							/>
							<span>Active</span>
						</div>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						disabled={isSubmittingForm}
						onClick={closeModal}
						variant="outlined"
						color="warning"
					>
						Close
					</Button>
					<Button
						disabled={isSubmittingForm}
						onClick={handlePacksSubmit}
						variant="contained"
						color="primary"
					>
						{modalType === "add" && !isSubmittingForm
							? "Save"
							: modalType === "update" && !isSubmittingForm
								? "Update"
								: "Submitting"}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Packs;
