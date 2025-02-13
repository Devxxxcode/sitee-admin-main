import { AiOutlineLoading } from "react-icons/ai";
import React, { useState, useMemo, useEffect } from "react";
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
	TablePagination,
	Select,
	MenuItem as DropdownItem,
	FormControl,
	InputLabel,
	Collapse,
	Menu,
	MenuItem,
	DialogActions,
	DialogContent,
	DialogTitle,
	Dialog,
} from "@mui/material";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { useAllUsers } from "../../hooks/use-all-users";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { validateForm } from "../../helpers/validate-form";
import { toast } from "sonner";
import { usePostRequestMutation } from "../../services/api/request";
import { ENDPOINT } from "../../constants/endpoint";
import { invalidateRequestTag } from "../../services/api/invalidate-request-tag";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import { BiCopy } from "react-icons/bi";

const AllUsers = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "id",
		direction: "asc",
	});
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [page, setPage] = useState(0);
	const [expandedRows, setExpandedRows] = useState({});
	const [filter, setFilter] = useState(
		searchParams.get("order") || "No filter",
	);
	const [generatedCode, setGeneratedCode] = useState("");
	const [anchorEl, setAnchorEl] = useState(null);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [selectedImage, setSelectedImage] = useState("");

	const { users, refetchUsers } = useAllUsers();

	const [tableData, setTableData] = useState([]);

	useEffect(() => {
		if (users?.data) {
			const newData = users.data.map((item) => ({
				...item,
				gender:
					item?.gender.toLowerCase() === "m"
						? "Male"
						: item?.gender.toLowerCase() === "f"
							? "Female"
							: item?.gender,
				phoneNo: item?.phone_number,
				balance: item?.wallet?.balance || 0,
				referralCode: item?.referral_code,
				submissions: `${item?.total_play}/${item?.total_available_play}`,
				active: item?.is_active,
				profit: item?.today_profit || 0,
				total_submission_set:
					item?.number_of_submission_set_today ||
					item?.wallet?.package?.number_of_set
						? `${item?.number_of_submission_set_today}/${item?.wallet?.package?.number_of_set}`
						: `0/0`,
			}));

			setTableData(newData);
		}
	}, [users?.data]);

	const columns = useMemo(() => {
		return [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Username", accessorKey: "username" },
			{ Header: "Phone No", accessorKey: "phoneNo" },
			{ Header: "Gender", accessorKey: "gender" },
			{ Header: "Balance", accessorKey: "balance" },
			{ Header: "Referral Code", accessorKey: "referralCode" },
			{ Header: "Image", accessorKey: "profile_picture" },
			{ Header: "Today’s submission total", accessorKey: "submissions" },
			{ Header: "Today’s profit", accessorKey: "profit" },
			{
				Header: "Total Submission Set",
				accessorKey: "total_submission_set",
			},
		];
	}, []);

	const [unrollDropdownAnchor, setUnrollDropdownAnchor] = useState(null); // State for the dropdown anchor
	const [selectedRow, setSelectedRow] = useState(null); // Keep track of the selected row for modals

	const handleUnrollDropdownOpen = (event, row) => {
		setUnrollDropdownAnchor(event.currentTarget); // Set dropdown anchor
		setSelectedRow(row); // Track the selected row
	};

	const handleUnrollDropdownClose = () => {
		setUnrollDropdownAnchor(null); // Close dropdown
		setSelectedRow(null); // Reset selected row
	};

	// Login Password
	const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
		useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleOpenUpdatePasswordModal = () => {
		setIsUpdatePasswordModalOpen(true);
	};

	const handleCloseUpdatePasswordModal = () => {
		setIsUpdatePasswordModalOpen(false);
	};

	const [postLoginPassword, { isLoading: loadingPostLoginPassword }] =
		usePostRequestMutation();
	const handleSave = async () => {
		const userID = selectedRow.id;

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			const res = await postLoginPassword({
				url: ENDPOINT.UPDATE_LOGIN_PASSWORD,
				body: {
					user: userID,
					password: password,
				},
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);
			setIsUpdatePasswordModalOpen(false);
		} catch (error) {
			console.error(error);
		}
	};

	// Withdrawal Password
	const [
		isUpdateWithdrawalPasswordModalOpen,
		setIsUpdateWithdrawalPasswordModalOpen,
	] = useState(false);
	const [withdrawalPassword, setWithdrawalPassword] = useState("");
	const [confirmWithdrawalPassword, setConfirmWithdrawalPassword] =
		useState("");

	const handleOpenUpdateWithdrawalPasswordModal = () => {
		setIsUpdateWithdrawalPasswordModalOpen(true);
	};

	const handleCloseUpdateWithdrawalPasswordModal = () => {
		setIsUpdateWithdrawalPasswordModalOpen(false);
	};

	const [
		postWithdrawalPassword,
		{ isLoading: loadingPostWithdrawalPassword },
	] = usePostRequestMutation();
	const handleSaveWithdrawalPassword = async () => {
		const userID = selectedRow.id;

		if (withdrawalPassword !== confirmWithdrawalPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			const res = await postWithdrawalPassword({
				url: ENDPOINT.UPDATE_WITHDRAWAL_PASSWORD,
				body: {
					user: userID,
					password: withdrawalPassword,
				},
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);
			setIsUpdateWithdrawalPasswordModalOpen(false);
		} catch (error) {
			console.error(error);
		}
	};

	// Customer Balance
	const [
		isUpdateCustomerBalanceModalOpen,
		setIsUpdateCustomerBalanceModalOpen,
	] = useState(false);
	const [customerBalance, setCustomerBalance] = useState(10);
	const [balanceChangeReason, setBalanceChangeReason] = useState("");
	const [adminPassword, setAdminPassword] = useState("");

	const handleOpenUpdateCustomerBalanceModal = () => {
		setIsUpdateCustomerBalanceModalOpen(true);
	};

	const handleCloseUpdateCustomerBalanceModal = () => {
		setIsUpdateCustomerBalanceModalOpen(false);
	};

	const [postCustomerBalance, { isLoading: postingCustomerBalance }] =
		usePostRequestMutation();
	const handleSaveCustomerBalance = async () => {
		const userID = selectedRow.id;

		const values = {
			user: userID,
			balance: customerBalance,
			reason: balanceChangeReason,
			admin_password: adminPassword,
		};

		if (!validateForm(values)) return;

		try {
			const res = await postCustomerBalance({
				url: ENDPOINT.UPDATE_CUSTOMER_BALANCE,
				body: values,
			}).unwrap();

			toast.success(res?.message);
			setIsUpdateCustomerBalanceModalOpen(false);
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);

			setAdminPassword("");
			setBalanceChangeReason("");
			setCustomerBalance("");
		} catch (err) {
			console.error(err);
		}
	};

	const [isUpdateProfitModalOpen, setIsUpdateProfitModalOpen] =
		useState(false);
	const [profitLoginUser, setProfitLoginUser] = useState("");
	const [customerProfit, setCustomerProfit] = useState("");
	const [profitChangeReason, setProfitChangeReason] = useState("");

	const handleOpenUpdateProfitModal = () => {
		setIsUpdateProfitModalOpen(true);
	};

	const handleCloseUpdateProfitModal = () => {
		setIsUpdateProfitModalOpen(false);
	};

	const [postSaveProfit, { isLoading: loadingSaveProfit }] =
		usePostRequestMutation();
	const handleSaveProfit = async () => {
		try {
			const userID = selectedRow.id;

			const values = {
				user: userID,
				profit: customerProfit,
				reason: profitChangeReason,
				admin_password: adminPassword,
			};

			if (!validateForm(values)) return;

			const res = await postSaveProfit({
				url: ENDPOINT.UPDATE_TODAY_PROFIT,
				body: values,
			}).unwrap();

			toast.success(res?.message);
			setIsUpdateProfitModalOpen(false);
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);

			setAdminPassword("");
			setProfitChangeReason("");
			setCustomerProfit("");
		} catch (err) {
			console.error(err);
		}
	};

	const [isUpdateSalaryModalOpen, setIsUpdateSalaryModalOpen] =
		useState(false);
	const [customerSalary, setCustomerSalary] = useState("");
	const [salaryChangeReason, setSalaryChangeReason] = useState("");

	const handleOpenUpdateSalaryModal = () => {
		setIsUpdateSalaryModalOpen(true);
	};

	const handleCloseUpdateSalaryModal = () => {
		setIsUpdateSalaryModalOpen(false);
	};

	const [postSaveSalary, { isLoading: loadingUpdateSalary }] =
		usePostRequestMutation();
	const handleSaveSalary = async () => {
		try {
			const userID = selectedRow.id;

			const values = {
				user: userID,
				salary: customerSalary,
				reason: salaryChangeReason,
				admin_password: adminPassword,
			};

			if (!validateForm(values)) return;

			const res = await postSaveSalary({
				url: ENDPOINT.UPDATE_TODAY_SALARY,
				body: values,
			}).unwrap();

			toast.success(res?.message);
			setIsUpdateSalaryModalOpen(false);
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);

			setCustomerSalary("");
			setSalaryChangeReason("");
			setAdminPassword("");
		} catch (err) {
			console.error(err);
		}
	};

	// Update Credit Score
	const [creditScore, setCreditScore] = useState("");
	const [isUpdateCreditScoreModalOpen, setIsUpdateCreditScoreModalOpen] =
		useState(false);
	const handleOpenUpdateCreditScoreModal = () => {
		setIsUpdateCreditScoreModalOpen(true);
	};

	const handleCloseUpdateCreditScoreModal = () => {
		setIsUpdateCreditScoreModalOpen(false);
	};

	const [postUpdateCreditScore, { isLoading: loadingUpdateCreditScore }] =
		usePostRequestMutation();
	const handleUpdateCreditScore = async () => {
		try {
			const userID = selectedRow.id;

			const formValues = {
				user: userID,
				credit_score: creditScore,
				admin_password: adminPassword,
			};

			if (!validateForm(formValues, ["user"])) return;

			const res = await postUpdateCreditScore({
				url: ENDPOINT.POST_UPDATE_CREDIT_SCORE,
				body: formValues,
			}).unwrap();

			toast?.success(res?.message);

			setCreditScore("");
			setAdminPassword("");

			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);
			setIsUpdateCreditScoreModalOpen(false);
		} catch (err) {
			console.error(err);
		}
	};

	const [isResetAccountModalOpen, setIsResetAccountModalOpen] =
		useState(false);

	const handleOpenResetAccountModal = () => {
		setIsResetAccountModalOpen(true);
	};

	const handleCloseResetAccountModal = () => {
		setIsResetAccountModalOpen(false);
	};

	const [postResetAccount, { isLoading: loadingResetAccount }] =
		usePostRequestMutation();
	const handleSaveResetAccount = async () => {
		try {
			const userID = selectedRow.id;

			const formValues = {
				user: userID,
				admin_password: adminPassword,
			};

			if (!validateForm(formValues)) return;

			const res = await postResetAccount({
				url: ENDPOINT.POST_REST_ACCOUNT_FOR_TASK,
				body: formValues,
			}).unwrap();

			toast?.success(res?.message);

			setAdminPassword("");
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);
			setIsResetAccountModalOpen(false);
		} catch (err) {
			console.error(err);
		}
	};

	const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
	const [userInfo, setUserInfo] = useState({
		username: "test",
		fullName: "N/A",
		trcAddress: "N/A",
		trcPhone: "N/A",
		exchange: "N/A",
		email: "N/A",
	});

	const handleOpenUserInfoModal = (row) => {
		handleSeeMoreInfo();
		setIsUserInfoModalOpen(true);
	};

	const handleCloseUserInfoModal = () => {
		setIsUserInfoModalOpen(false);
		setUserInfo({});
	};

	const [isRemoveBonusModalOpen, setIsRemoveBonusModalOpen] = useState(false);

	const handleOpenRemoveBonusModal = (row) => {
		setSelectedRow(row); // Set the selected row data
		setIsRemoveBonusModalOpen(true);
	};

	const handleCloseRemoveBonusModal = () => {
		setIsRemoveBonusModalOpen(false);
	};

	const [isDeactivateBalanceModalOpen, setIsDeactivateBalanceModalOpen] =
		useState(false);

	const handleOpenDeactivateBalanceModal = () => {
		setIsDeactivateBalanceModalOpen(true);
	};

	const handleCloseDeactivateBalanceModal = () => {
		setIsDeactivateBalanceModalOpen(false);
	};

	const handleExportPDF = () => {
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
		doc.save("allusers-data.pdf");
	};

	const handleExportCSV = () => {
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
		link.download = "allusers-data.csv";
		link.click();
	};

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleColumnToggle = (key) => {
		setHiddenColumns((prev) =>
			prev.includes(key)
				? prev.filter((col) => col !== key)
				: [...prev, key],
		);
	};

	const handleSort = (key) => {
		setSortConfig((prevConfig) => ({
			key,
			direction:
				prevConfig.key === key && prevConfig.direction === "asc"
					? "desc"
					: "asc",
		}));
	};

	const handleSearch = (e) => {
		setSearch(e.target.value);
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleExpandRow = (id) => {
		setExpandedRows((prevState) => ({
			...prevState,
			[id]: !prevState[id],
		}));
	};

	const handleFilterChange = (event) => {
		const value = event.target.value;
		setFilter(value);

		setSearchParams({
			...Object.fromEntries(searchParams.entries()),
			order: value,
		});
	};

	const [postGenerateCode, { isLoading: loadingGenerateCode }] =
		usePostRequestMutation();
	const handleGenerateCode = async () => {
		setGeneratedCode("");

		try {
			const res = await postGenerateCode({
				url: ENDPOINT.POST_GENERATE_CODE,
			}).unwrap();

			toast.success(res?.message);
			setGeneratedCode(res?.data?.invitation_code);
		} catch (err) {
			console.error(err);
		}
	};

	const [postToggleRegBonus, { isLoading: loadingToggleRegBonus }] =
		usePostRequestMutation();

	const handleRemoveRegistrationBonus = async () => {
		try {
			const userID = selectedRow.id;

			const formData = {
				user: userID,
				admin_password: adminPassword,
			};

			if (!validateForm(formData)) return;

			const res = await postToggleRegBonus({
				url: ENDPOINT.UPDATE_REG_BONUS,
				body: formData,
			}).unwrap();

			toast.success(res?.message);

			setSelectedRow({
				...selectedRow,
				is_reg_balance_add: res?.data?.is_reg_balance_add,
			});

			setAdminPassword("");
			handleCloseRemoveBonusModal();

			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);
		} catch (err) {
			console.error(err);
		}
	};

	const [postToggleMinBalance, { isLoading: loadingToggleMinBalance }] =
		usePostRequestMutation();
	const handleToggleMinBalance = async () => {
		try {
			const res = await postToggleMinBalance({
				url: ENDPOINT.UPDATE_MIN_BALANCE,
				body: {
					user: selectedRow.id,
				},
			}).unwrap();

			toast.success(res?.message);

			setSelectedRow({
				...selectedRow,
				is_min_balance_for_submission_removed:
					res?.data?.is_min_balance_for_submission_removed,
			});
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);
			handleCloseDeactivateBalanceModal();
		} catch (err) {
			console.error(err);
		}
	};

	const [postSeeMoreInfo, { isLoading: loadingSeeMoreInfo }] =
		usePostRequestMutation();

	const handleSeeMoreInfo = async () => {
		try {
			const userID = selectedRow?.id;

			const res = await postSeeMoreInfo({
				url: ENDPOINT.POST_SEE_MORE_INFORMATION,
				body: {
					user: userID,
				},
			}).unwrap();

			setUserInfo(res?.data);
		} catch (err) {
			console.error(err);
		}
	};

	const [postUserActive, { isLoading: loadingUserActive }] =
		usePostRequestMutation();
	const handleToggleUserActive = async (userID) => {
		try {
			const res = await postUserActive({
				url: ENDPOINT.POST_USER_ACTIVE,
				body: {
					user: userID,
				},
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_ALL_USERS);
		} catch (err) {
			console.error(err);
		}
	};

	const filteredData = useMemo(() => {
		return tableData.filter((row) => {
			const searchLower = search.toLowerCase();

			return Object.values(row).some((value) =>
				String(value).toLowerCase().includes(searchLower),
			);
		});
	}, [search, tableData]);

	const sortedData = useMemo(() => {
		const sorted = [...filteredData];
		if (sortConfig.key) {
			sorted.sort((a, b) => {
				if (a[sortConfig.key] < b[sortConfig.key]) {
					return sortConfig.direction === "asc" ? -1 : 1;
				}
				if (a[sortConfig.key] > b[sortConfig.key]) {
					return sortConfig.direction === "asc" ? 1 : -1;
				}
				return 0;
			});
		}
		return sorted;
	}, [filteredData, sortConfig]);

	const displayedData = sortedData.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage,
	);

	if (users.isLoading) {
		return <Loading />;
	}
	if (users.isError) {
		return <Error retry={refetchUsers} />;
	}

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">Users List</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Users List</span>
				</nav>
			</div>
			<div className="grid justify-start grid-cols-2 gap-2 mb-4 md:flex">
				<FormControl size="small">
					<InputLabel>Sort By Order</InputLabel>

					<Select value={filter} onChange={handleFilterChange}>
						<DropdownItem value="No filter">No filter</DropdownItem>

						<DropdownItem value="-wallet_commission">
							Highest income
						</DropdownItem>

						<DropdownItem value="-total_games_played">
							Total products submitted descending
						</DropdownItem>

						<DropdownItem value="-total_negative_product">
							Total negative products descending
						</DropdownItem>
					</Select>
				</FormControl>

				<Button
					className="h-10"
					variant="contained"
					color="warning"
					onClick={handleExportCSV}
					size="small"
				>
					Export CSV
				</Button>

				<Button
					className="h-10"
					variant="contained"
					color="error"
					onClick={handleExportPDF}
					size="small"
				>
					Export PDF
				</Button>

				<Button
					className="h-10 mr-4"
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

				{/* Copy Code */}
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative ">
						<TextField
							size="small"
							InputProps={{
								readOnly: true,
							}}
							value={generatedCode}
						/>

						<div className="absolute right-0 -translate-y-1/2 top-1/2">
							{generatedCode && (
								<Button
									color="primary"
									onClick={() => {
										navigator.clipboard.writeText(generatedCode);
										toast.success("Copied");
									}}
									style={{ textTransform: "none", fontSize: "14px" }}
									className="h-full"
								>
									<BiCopy className="size-6" />
								</Button>
							)}
						</div>
					</div>

					<Button
						className="ml-4"
						onClick={handleGenerateCode}
						color="success"
						variant="contained"
						size="large"
						disabled={loadingGenerateCode}
						style={{
							fontSize: "14px",
							textTransform: "none",
							gap: "10px",
						}}
					>
						{loadingGenerateCode && (
							<AiOutlineLoading className="animate-spin" />
						)}{" "}
						Generate an invitation code
					</Button>
				</div>

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
							{columns
								.filter(
									(column) =>
										!hiddenColumns.includes(column.accessorKey),
								) // Filter out hidden columns
								.map((column) => (
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
								))}
						</TableRow>
					</TableHead>
					<TableBody>
						{displayedData.map((row, index) => (
							<React.Fragment key={row.id}>
								<TableRow>
									{/* Combined + button and row number with reduced width */}
									<TableCell
										style={{
											width: "50px",
											textAlign: "center",
											padding: "4px",
										}}
									>
										<div
											style={{
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											<Button
												size="small"
												onClick={() => handleExpandRow(row.id)}
												style={{ minWidth: "25px", padding: "0" }}
											>
												{expandedRows[row.id] ? "-" : "+"}
											</Button>
											<span style={{ marginLeft: "4px" }}>
												{index + 1}
											</span>
										</div>
									</TableCell>

									{columns
										.filter(
											(column) =>
												!hiddenColumns.includes(column.accessorKey),
										) // Filter out hidden columns
										.map((column) =>
											column.accessorKey !== "id" &&
											column.accessorKey !== "profile_picture" ? (
												<TableCell key={column.accessorKey}>
													{row[column.accessorKey]}
												</TableCell>
											) : column.accessorKey ===
											  "profile_picture" ? (
												<img
													src={
														row[column.accessorKey]
															? row[column.accessorKey]
															: "/empty-user.jpg"
													}
													alt={`Screenshot ${row.id}`}
													className="object-cover w-auto h-12 cursor-pointer"
													onClick={() =>
														setSelectedImage(
															row[column.accessorKey],
														)
													}
												/>
											) : null,
										)}
								</TableRow>

								<TableRow>
									<TableCell
										colSpan={
											columns.filter(
												(col) =>
													!hiddenColumns.includes(col.accessorKey),
											).length
										} // Adjust colspan
										style={{ padding: 0 }}
									>
										<Collapse in={expandedRows[row.id]}>
											<div className="p-4">
												<p>
													<strong>
														Total products submitted:
													</strong>{" "}
													{row?.total_product_submitted}
												</p>
												<p>
													<strong>
														Total negative products submitted:
													</strong>{" "}
													{row?.total_negative_product_submitted}
												</p>
												<p>
													<strong>Total wallet commision:</strong>{" "}
													{row?.wallet?.commission}
												</p>
												<p>
													<strong>On hold:</strong>{" "}
													{row?.wallet?.on_hold}
												</p>
												<p>
													<strong>Salary:</strong>{" "}
													{row?.wallet?.salary}
												</p>
												<p>
													<strong>Level:</strong>{" "}
													{row?.wallet?.package?.name}
												</p>
												<p>
													<strong>Last connection:</strong>{" "}
													{moment(row?.last_connection).format(
														"DD MMM YYYY h:mm A",
													) || "N/A"}
												</p>

												<p className="flex items-center gap-2">
													<strong className="flex items-center gap-2">
														{loadingUserActive && (
															<AiOutlineLoading className="animate-spin" />
														)}{" "}
														Active:
													</strong>{" "}
													<input
														type="checkbox"
														disabled={loadingUserActive}
														checked={row?.active}
														onChange={() =>
															handleToggleUserActive(row?.id)
														}
													/>
												</p>
												<Button
													size="small"
													variant="contained"
													color="secondary"
													onClick={(event) =>
														handleUnrollDropdownOpen(event, row)
													}
												>
													Unroll
												</Button>
												<Menu
													anchorEl={unrollDropdownAnchor}
													open={Boolean(unrollDropdownAnchor)}
													onClose={handleUnrollDropdownClose}
												>
													<MenuItem
														onClick={() => {
															handleOpenUpdatePasswordModal(
																selectedRow,
															);
														}}
													>
														Update login password
													</MenuItem>

													<MenuItem
														onClick={() => {
															handleOpenUpdateWithdrawalPasswordModal(
																selectedRow,
															);
														}}
													>
														Update withdrawal password
													</MenuItem>

													<MenuItem
														onClick={() => {
															handleOpenUpdateCustomerBalanceModal(
																selectedRow,
															);
															// setCustomerBalance(
															// 	selectedRow?.balance,
															// );
														}}
													>
														Update customer balance
													</MenuItem>

													<MenuItem
														onClick={() => {
															handleOpenUpdateProfitModal(
																selectedRow,
															);
															// setCustomerProfit(
															// 	selectedRow?.profit,
															// );
														}}
													>
														Update Today’s profit
													</MenuItem>

													<MenuItem
														onClick={() => {
															handleOpenUpdateSalaryModal(
																selectedRow,
															);
															// setCustomerSalary(
															// 	selectedRow?.wallet?.salary,
															// );
														}}
													>
														Update Today’s salary
													</MenuItem>

													<MenuItem
														onClick={() => {
															handleOpenUpdateCreditScoreModal(
																selectedRow,
															);
															setCreditScore(
																selectedRow?.wallet
																	?.credit_score,
															);
														}}
													>
														Update Credit Score
													</MenuItem>

													<MenuItem
														onClick={() => {
															handleOpenResetAccountModal(
																selectedRow,
															);
														}}
													>
														Reset account to start a new task
													</MenuItem>

													<MenuItem
														onClick={() =>
															handleOpenUserInfoModal(
																selectedRow,
															)
														}
													>
														See more information
													</MenuItem>

													<MenuItem
														onClick={() =>
															handleOpenRemoveBonusModal(
																selectedRow,
															)
														}
													>
														{selectedRow?.is_reg_balance_add
															? "Remove"
															: "Add"}{" "}
														registration bonus
													</MenuItem>

													<MenuItem
														onClick={
															handleOpenDeactivateBalanceModal
														}
													>
														{selectedRow?.is_min_balance_for_submission_removed
															? "Enable"
															: "Disable"}{" "}
														minimum balance for submissions
													</MenuItem>
												</Menu>
											</div>
										</Collapse>
									</TableCell>
								</TableRow>
							</React.Fragment>
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
				open={isUpdatePasswordModalOpen}
				onClose={handleCloseUpdatePasswordModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update Login Password</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-2 gap-4 mt-4">
						<TextField
							label="User"
							fullWidth
							disabled
							value={selectedRow?.username}
						/>

						<TextField
							label="Password"
							type="password"
							fullWidth
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<TextField
							label="Confirm Password"
							type="password"
							fullWidth
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>
				</DialogContent>

				<DialogActions>
					<Button
						disabled={loadingPostLoginPassword}
						onClick={handleCloseUpdatePasswordModal}
						color="warning"
						variant="outlined"
					>
						Close
					</Button>

					<Button
						disabled={loadingPostLoginPassword}
						onClick={handleSave}
						color="primary"
						variant="contained"
						sx={{
							gap: "10px",
						}}
					>
						{loadingPostLoginPassword && (
							<AiOutlineLoading className="animate-spin " />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Update Withdrawal Password Modal */}
			<Dialog
				open={isUpdateWithdrawalPasswordModalOpen}
				onClose={handleCloseUpdateWithdrawalPasswordModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update Withdrawal Password</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-2 gap-4 mt-4">
						<TextField
							label="User"
							fullWidth
							disabled
							value={selectedRow?.username}
						/>

						<TextField
							label="Withdrawal password"
							type="password"
							fullWidth
							value={withdrawalPassword}
							onChange={(e) => setWithdrawalPassword(e.target.value)}
						/>
						<TextField
							label="Confirm withdrawal password"
							type="password"
							fullWidth
							value={confirmWithdrawalPassword}
							onChange={(e) =>
								setConfirmWithdrawalPassword(e.target.value)
							}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseUpdateWithdrawalPasswordModal}
						color="warning"
						disabled={loadingPostWithdrawalPassword}
						variant="outlined"
					>
						Close
					</Button>
					<Button
						onClick={handleSaveWithdrawalPassword}
						color="primary"
						disabled={loadingPostWithdrawalPassword}
						variant="contained"
						sx={{
							gap: "10px",
						}}
					>
						{loadingPostWithdrawalPassword && (
							<AiOutlineLoading className="animate-spin " />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Update Customer Balance Modal */}
			<Dialog
				open={isUpdateCustomerBalanceModalOpen}
				onClose={handleCloseUpdateCustomerBalanceModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update Customer Balance</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-1 gap-4">
						<TextField
							label="User"
							fullWidth
							disabled
							margin="dense"
							value={selectedRow?.username}
						/>

						<TextField
							label="Current Customer Balance"
							fullWidth
							type="number"
							value={selectedRow?.balance}
							disabled
						/>

						<TextField
							label="Update Customer Balance"
							fullWidth
							type="number"
							value={customerBalance}
							onChange={(e) => setCustomerBalance(e.target.value)}
						/>
						<TextField
							label="Reason for change"
							fullWidth
							value={balanceChangeReason}
							onChange={(e) => setBalanceChangeReason(e.target.value)}
						/>
						<TextField
							label="Administrateur password"
							type="password"
							fullWidth
							value={adminPassword}
							onChange={(e) => setAdminPassword(e.target.value)}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						disabled={postingCustomerBalance}
						onClick={handleCloseUpdateCustomerBalanceModal}
						color="warning"
						variant="outlined"
					>
						Close
					</Button>
					<Button
						disabled={postingCustomerBalance}
						onClick={handleSaveCustomerBalance}
						color="primary"
						variant="contained"
					>
						{postingCustomerBalance && (
							<AiOutlineLoading className="animate-spin " />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Update Today's Profit Modal */}
			<Dialog
				open={isUpdateProfitModalOpen}
				onClose={handleCloseUpdateProfitModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update today’s profit</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-1 gap-4">
						<TextField
							label="User"
							fullWidth
							disabled
							margin="dense"
							value={selectedRow?.username}
						/>

						<TextField
							label="Current CUstomer Todays Profit"
							fullWidth
							type="number"
							value={selectedRow?.profit}
							disabled
						/>

						<TextField
							label="Update Customer Today’s profit"
							fullWidth
							type="number"
							value={customerProfit}
							onChange={(e) => setCustomerProfit(e.target.value)}
						/>
						<TextField
							label="Reason for change"
							fullWidth
							value={profitChangeReason}
							onChange={(e) => setProfitChangeReason(e.target.value)}
						/>
						<TextField
							label="Administrateur password"
							type="password"
							fullWidth
							value={adminPassword}
							onChange={(e) => setAdminPassword(e.target.value)}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseUpdateProfitModal}
						color="warning"
						variant="outlined"
						disabled={loadingSaveProfit}
					>
						Close
					</Button>
					<Button
						onClick={handleSaveProfit}
						color="primary"
						variant="contained"
						disabled={loadingSaveProfit}
					>
						{loadingSaveProfit && (
							<AiOutlineLoading className="animate-spin " />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Update Today's Salary Modal */}
			<Dialog
				open={isUpdateSalaryModalOpen}
				onClose={handleCloseUpdateSalaryModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update today’s salary</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-1 gap-4">
						<TextField
							label="User"
							fullWidth
							disabled
							margin="dense"
							value={selectedRow?.username}
						/>

						<TextField
							label="Current Customer Today’s salary"
							fullWidth
							type="number"
							value={selectedRow?.wallet?.salary}
							disabled
						/>

						<TextField
							label="Update Customer Today’s salary"
							fullWidth
							type="number"
							value={customerSalary}
							onChange={(e) => setCustomerSalary(e.target.value)}
						/>
						<TextField
							label="Reason for change"
							fullWidth
							value={salaryChangeReason}
							onChange={(e) => setSalaryChangeReason(e.target.value)}
						/>
						<TextField
							label="Administrateur password"
							type="password"
							fullWidth
							value={adminPassword}
							onChange={(e) => setAdminPassword(e.target.value)}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseUpdateSalaryModal}
						disabled={loadingUpdateSalary}
						color="warning"
						variant="outlined"
					>
						Close
					</Button>
					<Button
						onClick={handleSaveSalary}
						disabled={loadingUpdateSalary}
						color="primary"
						variant="contained"
					>
						{loadingUpdateSalary && (
							<AiOutlineLoading className="animate-spin " />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Update Today's Profit Modal */}
			<Dialog
				open={isUpdateCreditScoreModalOpen}
				onClose={handleCloseUpdateCreditScoreModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Update Credit Score</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-1 gap-4">
						<TextField
							label="User"
							fullWidth
							disabled
							margin="dense"
							value={selectedRow?.username}
						/>

						<TextField
							label="Customer Credit Score"
							fullWidth
							type="number"
							value={creditScore}
							onChange={(e) => setCreditScore(e.target.value)}
						/>
						<TextField
							label="Administrateur password"
							type="password"
							fullWidth
							value={adminPassword}
							onChange={(e) => setAdminPassword(e.target.value)}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseUpdateCreditScoreModal}
						color="warning"
						variant="outlined"
						disabled={loadingUpdateCreditScore}
					>
						Close
					</Button>
					<Button
						onClick={handleUpdateCreditScore}
						color="primary"
						variant="contained"
						disabled={loadingUpdateCreditScore}
					>
						{loadingUpdateCreditScore && (
							<AiOutlineLoading className="animate-spin " />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Reset Customer Account Modal */}
			<Dialog
				open={isResetAccountModalOpen}
				onClose={handleCloseResetAccountModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Reset customer account</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-1 gap-4">
						<TextField
							label="User"
							fullWidth
							disabled
							margin="dense"
							value={selectedRow?.username}
						/>

						<TextField
							label="Administrateur password"
							type="password"
							fullWidth
							value={adminPassword}
							onChange={(e) => setAdminPassword(e.target.value)}
						/>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseResetAccountModal}
						color="warning"
						variant="outlined"
						disabled={loadingResetAccount}
					>
						Close
					</Button>
					<Button
						onClick={handleSaveResetAccount}
						color="primary"
						variant="contained"
						disabled={loadingResetAccount}
					>
						{loadingResetAccount && (
							<AiOutlineLoading className="animate-spin " />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* User Information Modal */}
			<Dialog
				open={isUserInfoModalOpen}
				onClose={handleCloseUserInfoModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>User Information</DialogTitle>
				<DialogContent>
					{loadingSeeMoreInfo ? (
						<Loading className="my-14" />
					) : (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p>
									<strong>Username:</strong>{" "}
									{userInfo.username || "N/A"}
								</p>

								<Button
									color="primary"
									style={{ textTransform: "none" }}
									onClick={() =>
										navigator.clipboard.writeText(
											userInfo.username || "N/A",
										)
									}
								>
									Copy text
								</Button>
							</div>
							<div>
								<p>
									<strong>Full name:</strong>{" "}
									{`${userInfo?.first_name} ${userInfo?.last_name}` ||
										"N/A"}
								</p>

								<Button
									color="primary"
									style={{ textTransform: "none" }}
									onClick={() =>
										navigator.clipboard.writeText(
											`${userInfo?.first_name} ${userInfo?.last_name}` ||
												"N/A",
										)
									}
								>
									Copy text
								</Button>
							</div>

							<div>
								<p>
									<strong>TRC address:</strong>{" "}
									{userInfo?.use_payment_method?.wallet || "N/A"}
								</p>
								<Button
									color="primary"
									style={{ textTransform: "none" }}
									onClick={() =>
										navigator.clipboard.writeText(
											userInfo?.use_payment_method?.wallet || "N/A",
										)
									}
								>
									Copy text
								</Button>
							</div>
							<div>
								<p>
									<strong>TRC phone:</strong>{" "}
									{userInfo.phone_number || "N/A"}
								</p>
								<Button
									color="primary"
									style={{ textTransform: "none" }}
									onClick={() =>
										navigator.clipboard.writeText(
											userInfo.phone_number || "N/A",
										)
									}
								>
									Copy text
								</Button>
							</div>
							<div>
								<p>
									<strong>Exchange:</strong>{" "}
									{userInfo?.use_payment_method?.exchange || "N/A"}
								</p>
								<Button
									color="primary"
									style={{ textTransform: "none" }}
									onClick={() =>
										navigator.clipboard.writeText(
											userInfo.exchange || "N/A",
										)
									}
								>
									Copy text
								</Button>
							</div>
							<div>
								<p>
									<strong>Email address:</strong>{" "}
									{userInfo.email || "N/A"}
								</p>
								<Button
									color="primary"
									style={{ textTransform: "none" }}
									onClick={() =>
										navigator.clipboard.writeText(
											userInfo.email || "N/A",
										)
									}
								>
									Copy text
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCloseUserInfoModal}
						color="warning"
						variant="outlined"
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>

			{/* Remove Customer's Registration Bonus Modal */}
			<Dialog
				open={isRemoveBonusModalOpen}
				onClose={handleCloseRemoveBonusModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					{selectedRow?.is_reg_balance_add ? "Remove" : "Add"} Customers
					Registration Bonus
				</DialogTitle>

				<DialogContent>
					<TextField
						label="User"
						fullWidth
						disabled
						margin="dense"
						value={selectedRow?.username}
					/>

					<TextField
						label="Administrateur Password"
						fullWidth
						margin="normal"
						type="password"
						variant="outlined"
						onChange={(e) => setAdminPassword(e.target.value)}
					/>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={handleCloseRemoveBonusModal}
						disabled={loadingToggleRegBonus}
						variant="outlined"
						color="warning"
					>
						Close
					</Button>

					<Button
						onClick={handleRemoveRegistrationBonus}
						disabled={loadingToggleRegBonus}
						variant="contained"
						color="primary"
					>
						{loadingToggleRegBonus && (
							<AiOutlineLoading className="animate-spin" />
						)}{" "}
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Deactivate Minimum Balance Modal */}
			<Dialog
				open={isDeactivateBalanceModalOpen}
				onClose={handleCloseDeactivateBalanceModal}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					<span style={{ color: "#1A73E8", fontWeight: "bold" }}>
						Adsterra
					</span>
				</DialogTitle>
				<DialogContent>
					<p>
						Do you confirm the{" "}
						{selectedRow?.is_min_balance_for_submission_removed
							? "activation"
							: "deactivation"}{" "}
						of the minimum balance for submissions?
					</p>
				</DialogContent>

				<DialogActions>
					<Button
						onClick={handleCloseDeactivateBalanceModal}
						variant="contained"
						color="error"
						disabled={loadingToggleMinBalance}
					>
						Cancel
					</Button>

					<Button
						onClick={handleToggleMinBalance}
						variant="contained"
						color="primary"
						disabled={loadingToggleMinBalance}
					>
						{loadingToggleMinBalance && (
							<AiOutlineLoading className="animate-spin" />
						)}{" "}
						Confirm
					</Button>
				</DialogActions>
			</Dialog>

			{/* User Image */}
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

export default AllUsers;
