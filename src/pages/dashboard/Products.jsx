import { AiOutlineLoading } from "react-icons/ai";
import { useState, useMemo, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import {
	usePostRequestMutation,
	usePatchRequestMutation,
	useDeleteRequestMutation,
} from "../../services/api/request";
import { ENDPOINT } from "../../constants/endpoint";
import { validateForm } from "../../helpers/validate-form";
import { convertToFormData } from "../../helpers/convert-to-form-data";
import { toast } from "sonner";
import { invalidateRequestTag } from "../../services/api/invalidate-request-tag";
import { useProducts } from "../../hooks/use-product";

const Products = () => {
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
		price: "",
		image: "",
		rating_no: "",
	});
	const [modalType, setModalType] = useState("add");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [tableData, setTableData] = useState([]);
	const [selectedImage, setSelectedImage] = useState("");

	// Memoized columns
	const columns = useMemo(
		() => [
			{ Header: "#", accessorKey: "id" },
			{ Header: "Name", accessorKey: "name" },
			{ Header: "Price", accessorKey: "price" },
			{ Header: "Image", accessorKey: "image" },
			{
				Header: "Rating Number",
				accessorKey: "rating_no",
			},
			{ Header: "Created On", accessorKey: "date_created" },
			{ Header: "Action", accessorKey: "actions" },
		],
		[],
	);

	// Memoized table data update
	const { products } = useProducts();

	useEffect(() => {
		if (products?.data) {
			setTableData(products?.data);
		}
	}, [products?.data]);

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

	// Modal handlers
	const openModal = useCallback((type, row = {}) => {
		setModalType(type);
		setCurrentRow(
			type === "update"
				? row
				: {
						id: "",
						name: "",
						price: "",
						image: "",
						rating_no: "",
						date_created: "",
					},
		);
		setIsModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setCurrentRow({
			id: "",
			name: "",
			price: "",
			image: "",
			rating_no: "",
			date_created: "",
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
	const [postProduct, { isLoading: isPostingProduct }] =
		usePostRequestMutation();
	const [patchProduct, { isLoading: isUpdatingProduct }] =
		usePatchRequestMutation();

	const isSubmittingForm = isPostingProduct || isUpdatingProduct;

	const handlePacksSubmit = useCallback(async () => {
		try {
			const { rating_no, ...formValues } = currentRow;

			if (!validateForm(formValues, ["id", "date_created"])) return;

			const formData = convertToFormData(formValues, ["image"]);

			if (modalType === "add") {
				await postProduct({
					url: ENDPOINT.ADD_PRODUCT,
					body: formData,
				}).unwrap();

				toast.success("Product added successfully");
			} else {
				await patchProduct({
					url: ENDPOINT.PATCH_PRODUCT.replace(":id", formValues.id),
					body: formData,
				}).unwrap();

				toast.success("Product updated successfully");
			}

			invalidateRequestTag(ENDPOINT.GET_PRODUCT);
			closeModal();
		} catch (error) {
			console.error(error);
		}
	}, [currentRow, modalType, postProduct, patchProduct, closeModal]);

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

	const [deleteProduct, { isLoading: isDeletingProduct }] =
		useDeleteRequestMutation();

	const handleProductDelete = async (id = "") => {
		try {
			await deleteProduct({
				url: ENDPOINT.DELETE_PRODUCT.replace(":id", id),
			}).unwrap();

			toast.success("Product deleted successfully");
			invalidateRequestTag(ENDPOINT.GET_PRODUCT);
		} catch (err) {
			console.error(err);
		}
	};

	if (products.isLoading) return <Loading />;
	if (products.isError) return <Error />;

	return (
		<div className="p-2 bg-gray-100 md:p-4">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-700">Products</h1>
				<nav className="text-sm text-gray-500">
					<span>Adsterra</span> /{" "}
					<span className="text-gray-700">Products</span>
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
					Add a Product
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
												) : col.accessorKey === "date_created" ? (
													moment(row.date_created).format(
														"DD MMM YYYY",
													)
												) : col.accessorKey === "image" ? (
													<img
														src={
															row.image instanceof File
																? URL.createObjectURL(row.image)
																: row.image
														}
														alt={`${row.name} image`}
														className="object-cover w-8 h-8 border rounded"
														onClick={() =>
															setSelectedImage(
																row[col.accessorKey],
															)
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
																isDeletingProduct &&
																currentRow.id === row.id
															}
															onClick={() => {
																setCurrentRow(row);
																handleProductDelete(row.id);
															}}
															sx={{
																gap: "10px",
															}}
														>
															{isDeletingProduct &&
																currentRow.id === row.id && (
																	<AiOutlineLoading className="animate-spin" />
																)}
															Delete
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
					{modalType === "add" ? "Add a Product" : "Update Product"}
				</DialogTitle>
				<DialogContent>
					<div className="grid grid-cols-2 gap-4">
						<TextField
							label="Name"
							fullWidth
							margin="normal"
							variant="outlined"
							value={currentRow.name}
							onChange={(e) =>
								setCurrentRow({ ...currentRow, name: e.target.value })
							}
						/>
						<TextField
							label="Price"
							fullWidth
							margin="normal"
							variant="outlined"
							type="number"
							value={currentRow.price}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									price: e.target.value,
								})
							}
						/>
						{/* <TextField
							label="Rating Number"
							fullWidth
							margin="normal"
							variant="outlined"
							className="col-span-2"
							type="number"
							value={currentRow.rating_no}
							onChange={(e) =>
								setCurrentRow({
									...currentRow,
									rating_no: e.target.value,
								})
							}
						/> */}

						<div className="flex items-center col-span-2 space-x-4">
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
												image: file,
											});
										}}
									/>
								</Button>
							</label>

							{currentRow.image ? (
								<img
									src={
										currentRow.image instanceof File
											? URL.createObjectURL(currentRow.image)
											: currentRow.image
									}
									alt="Image"
									className="object-cover w-12 h-12 border rounded"
								/>
							) : (
								<span className="ml-2 text-sm">No file chosen</span>
							)}
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
						sx={{
							gap: "10px",
						}}
					>
						{isSubmittingForm && (
							<AiOutlineLoading className="animate-spin" />
						)}
						{modalType === "add" ? "Save" : "Update"}
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

export default Products;
