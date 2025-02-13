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
import { useEvents } from "../../hooks/use-events";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import { AiOutlineLoading } from "react-icons/ai";

const Events = () => {
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "id",
		direction: "asc",
	});
	const [anchorEl, setAnchorEl] = useState(null);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState("add");
	const [currentRow, setCurrentRow] = useState({
		id: "",
		name: "",
		image: "",
		is_active: false,
		description: "",
		created_by: "",
	});
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [tableData, setTableData] = useState([]);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const openModal = (type, row = {}) => {
		setModalType(type);
		setCurrentRow(
			type === "update"
				? row
				: {
						id: "",
						name: "",
						image: "",
						is_active: false,
						description: "",
						created_by: "",
					},
		);
		setIsModalOpen(true);
	};

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setShowDeleteModal(false);
		setCurrentRow({
			id: "",
			name: "",
			image: "",
			is_active: false,
			description: "",
			created_by: "",
		});
	}, []);

	const {
		events,
		handleEventFormSubmit,
		isLoadingEventForm,
		handleDeleteEvent,
	} = useEvents(modalType, closeModal);

	// Update table data when `events.data` changes
	useEffect(() => {
		if (events?.data) {
			setTableData((prevData) => {
				// Prevent unnecessary state updates
				if (JSON.stringify(prevData) === JSON.stringify(events.data)) {
					return prevData;
				}
				return events.data.map((item) => ({
					...item,
					created_by: item?.created_by?.username,
				}));
			});
		}
	}, [events?.data]);

	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Name", accessorKey: "name" },
			{ Header: "Picture", accessorKey: "image" },
			{ Header: "Created by", accessorKey: "created_by" },
			{ Header: "Description", accessorKey: "description" },
			{ Header: "Active", accessorKey: "is_active", type: "boolean" },
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
			body: tableData.map((row) =>
				columns.map((col) =>
					col.accessorKey === "image" ? "Image" : row[col.accessorKey],
				),
			),
		});
		doc.save("events.pdf");
	};

	const handleExportCSV = () => {
		const csvData = [
			columns.map((col) => col.Header).join(","),
			...tableData.map((row) =>
				columns
					.map((col) =>
						col.accessorKey === "image" ? "Image" : row[col.accessorKey],
					)
					.join(","),
			),
		].join("\n");
		const blob = new Blob([csvData], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "events.csv";
		link.click();
	};

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

	const displayedData = sortedData.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	if (events.isLoading) {
		return <Loading />;
	}

	if (events.isError) {
		return <Error />;
	}

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">
					Events List
				</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Events List</span>
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
					Add an Event
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
						{displayedData.map((row, index) => (
							<TableRow key={row.id}>
								{columns.map((col) =>
									!hiddenColumns.includes(col.accessorKey) ? (
										<TableCell key={col.accessorKey}>
											{col.accessorKey === "id" ? (
												index + 1
											) : col.accessorKey === "image" ? (
												<img
													src={row.image}
													alt={`${row.name} Picture`}
													className="object-cover w-auto h-12 border rounded"
												/>
											) : col.accessorKey === "is_active" ? (
												<Checkbox
													checked={row.is_active}
													// onChange={() =>
													// 	handleCheckboxToggle(row.id)
													// }
												/>
											) : col.accessorKey === "actions" ? (
												<span className="flex gap-2">
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
														onClick={() => {
															setShowDeleteModal(true);
															setCurrentRow(row);
														}}
													>
														Delete
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
					count={tableData.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</TableContainer>

			{/* Add Edit Modal */}
			<Dialog
				open={isModalOpen}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					{modalType === "add" ? "Add an Event" : "Update Event"}
				</DialogTitle>

				<DialogContent>
					<form>
						<div className="grid grid-cols-2 gap-4">
							<TextField
								label="Name"
								fullWidth
								margin="normal"
								variant="outlined"
								value={currentRow.name}
								onChange={(e) =>
									setCurrentRow((prev) => ({
										...prev,
										name: e.target.value,
									}))
								}
							/>

							<TextField
								label="Description"
								fullWidth
								margin="normal"
								variant="outlined"
								value={currentRow.description}
								onChange={(e) =>
									setCurrentRow((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
							/>

							<div className="flex items-center">
								<Button variant="outlined" component="label">
									Choose Image
									<input
										type="file"
										hidden
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files[0];

											setCurrentRow((prev) => ({
												...prev,
												image: file,
											}));
										}}
									/>
								</Button>

								{currentRow.image && (
									<img
										src={
											currentRow.image instanceof File
												? URL.createObjectURL(currentRow.image)
												: currentRow.image
										}
										alt="Preview"
										className="w-auto h-12 ml-4 border rounded"
									/>
								)}
							</div>
							<div className="flex items-center col-span-2">
								<Checkbox
									checked={currentRow.is_active}
									onChange={(e) =>
										setCurrentRow((prev) => ({
											...prev,
											is_active: e.target.checked,
										}))
									}
								/>
								<span>Active</span>
							</div>
						</div>
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeModal} variant="outlined" color="warning">
						Close
					</Button>

					<Button
						disabled={isLoadingEventForm}
						onClick={() => handleEventFormSubmit(currentRow)}
						variant="contained"
						color="primary"
					>
						{isLoadingEventForm ? "Loading..." : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Modal */}
			<Dialog open={showDeleteModal} onClose={onclose}>
				<DialogTitle>Confirm delete ({currentRow.name})?</DialogTitle>

				<DialogContent>
					<p>
						Are you absolutely sure you want to continue with this action,
						as it cannot be reversed?
					</p>
				</DialogContent>

				<DialogActions>
					<Button onClick={closeModal} variant="outlined" color="primary">
						Close
					</Button>
					<Button
						disabled={isLoadingEventForm}
						onClick={() => handleDeleteEvent(currentRow?.id)}
						variant="contained"
						color="error"
					>
						{isLoadingEventForm ? (
							<AiOutlineLoading className="animate-spin" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Events;
