import { useState, useRef, useEffect } from "react";
import { ENDPOINT } from "../constants/endpoint";
import {
	useGetRequestQuery,
	usePatchRequestMutation,
} from "../services/api/request";
import { invalidateRequestTag } from "../services/api/invalidate-request-tag";
import { toast } from "sonner";
import { validateForm } from "../helpers/validate-form";

export const useDeposit = () => {
	const [search, setSearch] = useState("");
	const [sortConfig, setSortConfig] = useState({
		key: "number",
		direction: "asc",
	});
	const [anchorEl, setAnchorEl] = useState(null);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [selectedImage, setSelectedImage] = useState(null);
	const [openModal, setOpenModal] = useState({});
	const [showInputModal, setShowInputModal] = useState({
		open: false,
		admin_password: "",
		actionStatus: "",
	});
	const [status, setStatus] = useState("");

	console.log(openModal);

	const {
		data: depositsData,
		isLoading: isLoadingDeposits,
		isError: isErrorDeposits,
		refetch,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_DEPOSITS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	useEffect(() => {
		refetch(); // Force refetch on mount
	}, [refetch]);

	const deposits = {
		data: (depositsData?.data || [])
			.slice()
			.reverse()
			.map((item, index) => ({ ...item, number: index + 1 })),
		isLoading: isLoadingDeposits,
		isError: isErrorDeposits,
	};

	const [putStatusDeposit, { isLoading: isUpdatingeDepositStatus }] =
		usePatchRequestMutation();
	const handleDepositStatus = async () => {
		setStatus(showInputModal.actionStatus);

		const formValues = {
			status: showInputModal.actionStatus,
			admin_password: showInputModal.admin_password,
		};

		if (!validateForm(formValues, ["status"])) return;

		try {
			const res = await putStatusDeposit({
				url: ENDPOINT.EDIT_STATUS.replace(":id", openModal.id),
				body: formValues,
			}).unwrap();

			invalidateRequestTag(ENDPOINT.GET_DEPOSITS);
			toast.success(res?.message);
			
			setOpenModal({});

			setShowInputModal({
				open: false,
				admin_password: "",
				actionStatus: "",
			});
		} catch (err) {
			console.error(err);
		} finally {
			setStatus("");
		}
	};

	return {
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

		openModal,
		setOpenModal,
		showInputModal,
		setShowInputModal,

		handleDepositStatus,
		isUpdatingeDepositStatus,
		status,

		// Deposit Endpoint
		deposits,
	};
};
