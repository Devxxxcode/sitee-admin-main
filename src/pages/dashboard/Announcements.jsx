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
import { useAnnouncements } from "../../hooks/use-announcements";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import { AiOutlineLoading } from "react-icons/ai";

const Announcements = () => {
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "id",
		direction: "desc",
	});
	const [anchorEl, setAnchorEl] = useState(null);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState("add");
	const [currentRow, setCurrentRow] = useState({
		id: "",
		title: "",
		message: "",
		is_active: true,
		start_date: "",
		end_date: "",
	});
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [tableData, setTableData] = useState([]);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const openModal = (type, row = {}) => {
		setModalType(type);
		if (type === "update") {
			// Format dates for datetime-local input
			setCurrentRow({
				...row,
				start_date: row.start_date ? new Date(row.start_date).toISOString().slice(0, 16) : "",
				end_date: row.end_date ? new Date(row.end_date).toISOString().slice(0, 16) : "",
			});
		} else {
			setCurrentRow({
				id: "",
				title: "",
				message: "",
				is_active: true,
				start_date: "",
				end_date: "",
			});
		}
		setIsModalOpen(true);
	};

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setShowDeleteModal(false);
		setCurrentRow({
			id: "",
			title: "",
			message: "",
			is_active: true,
			start_date: "",
			end_date: "",
		});
	}, []);

	const {
		announcements,
		handleAnnouncementFormSubmit,
		isLoadingAnnouncementForm,
		handleDeleteAnnouncement,
	} = useAnnouncements(modalType, closeModal);

	// Update table data when `announcements.data` changes
	useEffect(() => {
		if (announcements?.data) {
			setTableData((prevData) => {
				// Prevent unnecessary state updates
				if (JSON.stringify(prevData) === JSON.stringify(announcements.data)) {
					return prevData;
				}
				return announcements.data;
			});
		}
	}, [announcements?.data]);

	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Title", accessorKey: "title" },
			{ Header: "Message", accessorKey: "message" },
			{ Header: "Active", accessorKey: "is_active", type: "boolean" },
			{ Header: "Start Date", accessorKey: "start_date" },
			{ Header: "End Date", accessorKey: "end_date" },
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
				columns.map((col) => row[col.accessorKey] || ""),
			),
		});
		doc.save("announcements.pdf");
	};

	const handleExportCSV = () => {
		const csvData = [
			columns.map((col) => col.Header).join(","),
			...tableData.map((row) =>
				columns
					.map((col) => row[col.accessorKey] || "")
					.join(","),
			),
		].join("\n");
		const blob = new Blob([csvData], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "announcements.csv";
		link.click();
	};

	const filteredData = useMemo(() => {
		return tableData.filter((row) =>
			row.title.toLowerCase().includes(search.toLowerCase()),
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

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return new Date(dateString).toLocaleString();
	};

	if (announcements.isLoading) {
		return <Loading />;
	}

	if (announcements.isError) {
		return <Error />;
	}

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">
					Announcements List
				</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Announcements List</span>
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
					placeholder="Search by title"
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
					Add Announcement
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
												index + 1 + page * rowsPerPage
											) : col.accessorKey === "message" ? (
												<div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
													{row.message}
												</div>
											) : col.accessorKey === "is_active" ? (
												<Checkbox checked={row.is_active} disabled />
											) : col.accessorKey === "start_date" || 
											   col.accessorKey === "end_date" ? (
												formatDate(row[col.accessorKey])
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

			{/* Add/Edit Modal */}
			<Dialog
				open={isModalOpen}
				onClose={closeModal}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle>
					{modalType === "add" ? "Add an Announcement" : "Update Announcement"}
				</DialogTitle>

				<DialogContent>
					<form>
						<div className="grid grid-cols-1 gap-4 mt-4">
							<TextField
								label="Title"
								fullWidth
								variant="outlined"
								value={currentRow.title}
								onChange={(e) =>
									setCurrentRow((prev) => ({
										...prev,
										title: e.target.value,
									}))
								}
								required
							/>

							<TextField
								label="Message"
								fullWidth
								multiline
								rows={4}
								variant="outlined"
								value={currentRow.message}
								onChange={(e) =>
									setCurrentRow((prev) => ({
										...prev,
										message: e.target.value,
									}))
								}
								required
								helperText="This message will be shown to users"
							/>

							<div className="grid grid-cols-2 gap-4">
								<TextField
									label="Start Date"
									type="datetime-local"
									fullWidth
									variant="outlined"
									value={currentRow.start_date}
									onChange={(e) =>
										setCurrentRow((prev) => ({
											...prev,
											start_date: e.target.value,
										}))
									}
									InputLabelProps={{
										shrink: true,
									}}
									required
								/>

								<TextField
									label="End Date"
									type="datetime-local"
									fullWidth
									variant="outlined"
									value={currentRow.end_date}
									onChange={(e) =>
										setCurrentRow((prev) => ({
											...prev,
											end_date: e.target.value,
										}))
									}
									InputLabelProps={{
										shrink: true,
									}}
									required
								/>
							</div>

							<div className="flex items-center">
								<Checkbox
									checked={currentRow.is_active}
									onChange={(e) =>
										setCurrentRow((prev) => ({
											...prev,
											is_active: e.target.checked,
										}))
									}
								/>
								<span>Active (show to users)</span>
							</div>
						</div>
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeModal} variant="outlined" color="warning">
						Close
					</Button>

					<Button
						disabled={isLoadingAnnouncementForm}
						onClick={() => handleAnnouncementFormSubmit(currentRow)}
						variant="contained"
						color="primary"
					>
						{isLoadingAnnouncementForm ? "Loading..." : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Modal */}
			<Dialog open={showDeleteModal} onClose={closeModal}>
				<DialogTitle>Confirm delete ({currentRow.title})?</DialogTitle>

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
						disabled={isLoadingAnnouncementForm}
						onClick={() => handleDeleteAnnouncement(currentRow?.id)}
						variant="contained"
						color="error"
					>
						{isLoadingAnnouncementForm ? (
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

export default Announcements;

