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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Autocomplete,
} from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
	useDeleteRequestMutation,
	usePatchRequestMutation,
	usePostRequestMutation,
} from "../../services/api/request";
import { ENDPOINT } from "../../constants/endpoint";
import { validateForm } from "../../helpers/validate-form";
import { AiOutlineLoading } from "react-icons/ai";
import { invalidateRequestTag } from "../../services/api/invalidate-request-tag";
import { toast } from "sonner";
import { useNegativeUser } from "../../hooks/use-negative-user";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import moment from "moment";

const NegUsers = () => {
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "id",
		direction: "asc",
	});
	const [anchorEl, setAnchorEl] = useState(null);
	const [dropdownState, setDropdownState] = useState({}); // Track dropdown state for each row
	const [hiddenColumns, setHiddenColumns] = useState([]);

	const [tableData, setTableData] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentRow, setCurrentRow] = useState({});
	const [modalType, setModalType] = useState("add");
	const { users, onHold, allUsers } = useNegativeUser();

	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Username", accessorKey: "username" },
			{ Header: "Negative", accessorKey: "negative", type: "boolean" },
			{
				Header: "Number of negative products",
				accessorKey: "negativeProducts",
			},
			{ Header: "Negative products submitted", accessorKey: "submitted" },
			{ Header: "Balance", accessorKey: "balance" },
			{ Header: "Today’s submission total", accessorKey: "submissionTotal" },
			{ Header: "Today’s profit", accessorKey: "profit" },
			{ Header: "Last Connection", accessorKey: "connection" },
			{ Header: "On Hold", accessorKey: "onHold" },
			{ Header: "Actions", accessorKey: "actions" },
		],
		[],
	);

	useEffect(() => {
		if (users?.data) {
			setTableData(
				users?.data.map((item) => ({
					...item,
					objectID: item.id,
					id: item?.user?.id,
					username: item?.user?.username,
					negative: item?.is_active,
					negativeProducts: item?.number_of_negative_product,
					submitted: item?.user?.total_negative_product_submitted,
					balance: item?.user?.wallet?.balance,
					submissionTotal: `${item?.user?.total_play}/${item?.user?.total_available_play}`,
					rank: item?.rank_appearance,
					profit: item?.user?.wallet?.commission,
					connection: moment(item?.user?.last_connection).format(
						"DD MM YYYY h:mmA",
					),
					onHold: item?.user?.wallet?.on_hold,
					rangeID: item?.on_hold?.id,
				})),
			);
		}
	}, [users?.data]);

	const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);

	// Separate state for dropdowns
	const [anchorElUnroll, setAnchorElUnroll] = useState(null); // For "Unroll" dropdown

	// Handlers for "Unroll" dropdownt
	const handleUnrollMenuOpen = (event, id) => {
		setAnchorElUnroll(event.currentTarget); // Set the anchor element
		toggleDropdown(id); // Open the correct dropdown for the row
	};
	const handleUnrollMenuClose = (id) => {
		setAnchorElUnroll(null); // Clear the anchor
		closeDropdown(id); // Close the dropdown for the row
	};

	const toggleDropdown = (id) => {
		setDropdownState((prevState) => ({
			...prevState,
			[id]: !prevState[id],
		}));
	};

	const closeDropdown = (id) => {
		setDropdownState((prevState) => ({
			...prevState,
			[id]: false,
		}));
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

	const openModal = (type, row = {}) => {
		setModalType(type);
		setCurrentRow(row);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setCurrentRow({});
	};

	const handleSave = () => {
		if (modalType === "add") {
			const newRow = {
				id: tableData.length + 1,
				...currentRow,
			};
			setTableData((prev) => [...prev, newRow]);
		} else {
			setTableData((prev) =>
				prev.map((row) => (row.id === currentRow.id ? currentRow : row)),
			);
		}
		closeModal();
	};

	const handleExportPDF = () => {
		const doc = new jsPDF();
		autoTable(doc, {
			head: [columns.map((col) => col.Header)],
			body: tableData.map((row) =>
				columns.map((col) => row[col.accessorKey]),
			),
		});
		doc.save("negative-users.pdf");
	};

	const handleExportCSV = () => {
		const csvData = [
			columns.map((col) => col.Header).join(","),
			...tableData.map((row) =>
				columns.map((col) => row[col.accessorKey]).join(","),
			),
		].join("\n");
		const blob = new Blob([csvData], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "negative-users.csv";
		link.click();
	};

	const filteredData = useMemo(() => {
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

	const [adminPassword, setAdminPassword] = useState("");

	const [postTodaysProfit, { isLoading: loadingPostTodaysProfit }] =
		usePostRequestMutation();
	const handleUpdateTodaysProfit = async () => {
		const formValues = {
			user: currentRow.id,
			reason: currentRow.reason,
			profit: currentRow.profit,
			admin_password: adminPassword,
		};

		if (!validateForm(formValues)) return;

		try {
			const res = await postTodaysProfit({
				url: ENDPOINT.UPDATE_TODAY_PROFIT,
				body: formValues,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_NEGATIVE_USERS);
			setAdminPassword("");
			closeModal();
		} catch (err) {
			console.error(err);
		}
	};

	const [postTodaysSalary, { isLoading: loadingPostTodaysSalary }] =
		usePostRequestMutation();
	const handleUpdateTodaysSalary = async () => {
		const formValues = {
			user: currentRow.id,
			reason: currentRow.reason,
			salary: currentRow.profit,
			admin_password: adminPassword,
		};

		if (!validateForm(formValues)) return;

		try {
			const res = await postTodaysSalary({
				url: ENDPOINT.UPDATE_TODAY_SALARY,
				body: formValues,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_NEGATIVE_USERS);
			setAdminPassword("");
			closeModal();
		} catch (err) {
			console.error(err);
		}
	};

	const [deleteNegativeUser, { isLoading: deletingNegativeUser }] =
		useDeleteRequestMutation();
	const handleUserDelete = async (id = "") => {
		const confirmDeletion = confirm(
			"Are you absolutely sure you want to proceed with this action, as it can not be revered?",
		);

		if (confirmDeletion) {
			try {
				await deleteNegativeUser({
					url: ENDPOINT.DELETE_NEGATIVE_USER.replace(":id", id),
				}).unwrap();

				invalidateRequestTag(ENDPOINT.GET_NEGATIVE_USERS);
			} catch (err) {
				console.error(err);
			}
		}
	};

	const [putUpdateNegativeUser, { isLoading: loadingNegativeUser }] =
		usePatchRequestMutation();
	const handleUpdateNegativeUser = async () => {
		try {
			const formValues = {
				user: currentRow.id,
				on_hold: currentRow?.rangeID,
				number_of_negative_product: currentRow.negativeProducts,
				rank_appearance: currentRow.rank,
			};

			const paramID = tableData.filter(
				(item) => item?.id === formValues.user,
			)[0]?.objectID;

			if (!validateForm(formValues)) return;

			const res = await putUpdateNegativeUser({
				url: ENDPOINT.PATCH_NEGATIVE_USER.replace(":id", paramID),
				body: formValues,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_NEGATIVE_USERS);
			closeModal();
			setCurrentRow({});
		} catch (err) {
			console.error(err);
		}
	};

	const [postAddNegativeUser, { isLoading: loadingAddNegativeUser }] =
		usePostRequestMutation();
	const handleAddNegativeUser = async () => {
		try {
			const formValues = {
				user: currentRow.userID,
				on_hold: currentRow?.rangeID,
				number_of_negative_product: currentRow.negativeProducts,
				rank_appearance: currentRow.rank,
			};

			if (!validateForm(formValues)) return;

			const res = await postAddNegativeUser({
				url: ENDPOINT.ADD_NEGATIVE_USER,
				body: formValues,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_NEGATIVE_USERS);
			closeModal();
			setCurrentRow({});
		} catch (err) {
			console.error(err);
		}
	};

	if (users.isLoading || onHold.isLoading || allUsers.isLoading) {
		return <Loading />;
	}

	if (users.isError || onHold.isError || allUsers.isLoading) {
		return <Error />;
	}

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">
					Negative Users List
				</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Negative Users List</span>
				</nav>
			</div>
			<div className="grid justify-start grid-cols-2 gap-2 mb-4 md:flex">
				<Button
					variant="contained"
					onClick={handleExportCSV}
					color="warning"
					size="small"
				>
					Excel
				</Button>
				<Button
					variant="contained"
					onClick={handleExportPDF}
					color="error"
					size="small"
				>
					PDF
				</Button>
				<Button
					variant="contained"
					color="info"
					size="small"
					onClick={handleMenuOpen}
				>
					Column visibility
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
					Add Negative User
				</Button>
			</div>

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
												{column.accessorKey === "negative" ? (
													<input
														type="checkbox"
														disabled={deletingNegativeUser}
														className="custom-checkbox"
														checked={row.negative}
														onChange={() =>
															handleUserDelete(row.objectID)
														}
													/>
												) : column.accessorKey === "id" ? (
													index + 1
												) : column.accessorKey === "actions" ? (
													<div>
														<Button
															variant="contained"
															color="secondary"
															size="small"
															onClick={(e) =>
																handleUnrollMenuOpen(e, row.id)
															}
														>
															Unroll
														</Button>
														{dropdownState[row.id] && (
															<Menu
																anchorEl={anchorElUnroll} // Use anchorElUnroll for positioning
																open={Boolean(
																	anchorElUnroll &&
																		dropdownState[row.id],
																)}
																onClose={() =>
																	handleUnrollMenuClose(row.id)
																}
															>
																<MenuItem
																	onClick={() => {
																		handleUnrollMenuClose(
																			row.id,
																		);
																		openModal("update", row);
																	}}
																>
																	Update
																</MenuItem>
																<MenuItem
																	onClick={() => {
																		handleUnrollMenuClose(
																			row.id,
																		);
																		openModal(
																			"updateProfit",
																			row,
																		);
																	}}
																>
																	Update Today’s profit
																</MenuItem>

																<MenuItem
																	onClick={() => {
																		handleUnrollMenuClose(
																			row.id,
																		);
																		openModal(
																			"updateSalary",
																			row,
																		);
																	}}
																>
																	Update Today’s salary
																</MenuItem>

																{/* <MenuItem
																	onClick={() => {
																		handleUnrollMenuClose(
																			row.id,
																		);
																		openModal(
																			"resubmit",
																			row,
																		);
																	}}
																>
																	Resubmit a negative product
																</MenuItem> */}
															</Menu>
														)}
													</div>
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
				/>
			</TableContainer>

			<Dialog
				open={isModalOpen && modalType === "add"}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Add Negative User</DialogTitle>

				<DialogContent>
					{/* Add Negative User Form */}
					<Autocomplete
						options={allUsers.data}
						getOptionLabel={(option) => option.username}
						value={
							allUsers.data.find(
								(item) => item.id === currentRow.userID,
							) || null
						}
						onChange={(event, newValue) => {
							setCurrentRow({
								...currentRow,
								userID: newValue ? newValue.id : "",
							});
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select a user"
								margin="normal"
								fullWidth
							/>
						)}
					/>

					{/* <Autocomplete
						options={allUsers.data.map((user) => user.username)}
						value={currentRow.username || ""}
						onChange={(event, newValue) =>
							setCurrentRow({ ...currentRow, username: newValue })
						}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select a user"
								margin="normal"
								fullWidth
							/>
						)}
					/> */}

					<Autocomplete
						options={Array.isArray(onHold.data) ? onHold.data : []}
						getOptionLabel={(option) =>
							`${Number(option?.min_amount)} - ${Number(option?.max_amount)}`
						}
						value={
							Array.isArray(onHold.data)
								? onHold.data.find(
										(item) => item.id === currentRow.rangeID,
									) || null // Match object based on id
								: null
						}
						onChange={(event, newValue) => {
							setCurrentRow({
								...currentRow,
								range: newValue,
								rangeID: newValue ? newValue.id : "",
							});
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select a range"
								margin="normal"
								fullWidth
							/>
						)}
					/>

					<TextField
						label="Number of negative products (simultaneously)"
						fullWidth
						margin="normal"
						variant="outlined"
						type="number"
						value={currentRow.negativeProducts || ""}
						onChange={(e) =>
							setCurrentRow({
								...currentRow,
								negativeProducts: e.target.value,
							})
						}
					/>

					<TextField
						label="Rank of appearance of the negative product"
						fullWidth
						margin="normal"
						variant="outlined"
						type="number"
						value={currentRow.rank || ""}
						onChange={(e) =>
							setCurrentRow({ ...currentRow, rank: e.target.value })
						}
					/>
				</DialogContent>

				<DialogActions>
					<Button
						disabled={loadingAddNegativeUser}
						onClick={closeModal}
						variant="outlined"
						color="warning"
					>
						Close
					</Button>
					<Button
						disabled={loadingAddNegativeUser}
						onClick={handleAddNegativeUser}
						variant="contained"
						color="primary"
					>
						{loadingAddNegativeUser && (
							<AiOutlineLoading className="animate-spin" />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={isModalOpen && modalType === "update"}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update User Details</DialogTitle>
				<DialogContent>
					{/* Select a user */}
					<Autocomplete
						options={allUsers.data.map((user) => user.username)}
						value={currentRow.username || ""}
						onChange={(event, newValue) =>
							setCurrentRow({ ...currentRow, username: newValue })
						}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select a user"
								margin="normal"
								fullWidth
							/>
						)}
					/>

					{/* Select a range */}
					<Autocomplete
						options={Array.isArray(onHold.data) ? onHold.data : []}
						getOptionLabel={(option) =>
							`${Number(option?.min_amount)} - ${Number(option?.max_amount)}`
						}
						value={
							Array.isArray(onHold.data)
								? onHold.data.find(
										(item) => item.id === currentRow.rangeID,
									) || null // Match object based on id
								: null
						}
						onChange={(event, newValue) => {
							setCurrentRow({
								...currentRow,
								range: newValue,
								rangeID: newValue ? newValue.id : "",
							});
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Select a range"
								margin="normal"
								fullWidth
							/>
						)}
					/>

					{/* Number of negative products */}
					<TextField
						label="Number of negative products (simultaneously)"
						fullWidth
						margin="normal"
						variant="outlined"
						type="number"
						value={currentRow.negativeProducts || ""}
						onChange={(e) =>
							setCurrentRow({
								...currentRow,
								negativeProducts: e.target.value,
							})
						}
					/>

					{/* Rank of appearance of the negative product */}
					<TextField
						label="Rank of appearance of the negative product"
						fullWidth
						margin="normal"
						variant="outlined"
						type="number"
						value={currentRow.rank || ""}
						onChange={(e) =>
							setCurrentRow({ ...currentRow, rank: e.target.value })
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						disabled={loadingNegativeUser}
						onClick={closeModal}
						variant="outlined"
						color="warning"
					>
						Close
					</Button>
					<Button
						disabled={loadingNegativeUser}
						onClick={handleUpdateNegativeUser}
						variant="contained"
						color="primary"
					>
						{loadingNegativeUser && (
							<AiOutlineLoading className="animate-spin" />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={isModalOpen && modalType === "updateProfit"}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update Today’s Profit</DialogTitle>
				<DialogContent>
					<TextField
						label="Customer Today’s Profit"
						fullWidth
						margin="normal"
						type="number"
						value={currentRow.profit || ""}
						onChange={(e) =>
							setCurrentRow({ ...currentRow, profit: e.target.value })
						}
					/>
					<TextField
						label="Reason for Change"
						fullWidth
						margin="normal"
						value={currentRow.reason || ""}
						onChange={(e) =>
							setCurrentRow({ ...currentRow, reason: e.target.value })
						}
					/>
					<TextField
						label="Administrateur Password"
						fullWidth
						margin="normal"
						type="password"
						value={adminPassword}
						onChange={(e) => setAdminPassword(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						disabled={loadingPostTodaysProfit}
						onClick={closeModal}
						variant="outlined"
						color="warning"
					>
						Close
					</Button>
					<Button
						disabled={loadingPostTodaysProfit}
						onClick={handleUpdateTodaysProfit}
						variant="contained"
						color="primary"
					>
						{loadingPostTodaysProfit && (
							<AiOutlineLoading className="animate-spin" />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={isModalOpen && modalType === "updateSalary"}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update Today’s Salary</DialogTitle>
				<DialogContent>
					<TextField
						label="Customer Today’s Salary"
						fullWidth
						margin="normal"
						type="number"
						value={currentRow.salary || ""}
						onChange={(e) =>
							setCurrentRow({ ...currentRow, salary: e.target.value })
						}
					/>
					<TextField
						label="Reason for Change"
						fullWidth
						margin="normal"
						value={currentRow.reason || ""}
						onChange={(e) =>
							setCurrentRow({ ...currentRow, reason: e.target.value })
						}
					/>
					<TextField
						label="Administrateur Password"
						fullWidth
						margin="normal"
						type="password"
						value={adminPassword}
						onChange={(e) => setAdminPassword(e.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						disabled={loadingPostTodaysSalary}
						onClick={closeModal}
						variant="outlined"
						color="warning"
					>
						Close
					</Button>
					<Button
						disabled={loadingPostTodaysSalary}
						variant="contained"
						color="primary"
						onClick={handleUpdateTodaysSalary}
					>
						{loadingPostTodaysSalary && (
							<AiOutlineLoading className="animate-spin" />
						)}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={isModalOpen && modalType === "resubmit"}
				onClose={closeModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Resubmit a Negative Product</DialogTitle>
				<DialogContent>
					<TextField
						label="Login User"
						fullWidth
						margin="normal"
						value={currentRow.username || ""}
						variant="outlined"
					/>
					<TextField
						label="Rank of Appearance of the Negative Product"
						fullWidth
						margin="normal"
						type="number"
						value={currentRow.rank || ""}
						onChange={(e) =>
							setCurrentRow({ ...currentRow, rank: e.target.value })
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeModal} variant="outlined" color="warning">
						Close
					</Button>
					<Button onClick={handleSave} variant="contained" color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default NegUsers;
