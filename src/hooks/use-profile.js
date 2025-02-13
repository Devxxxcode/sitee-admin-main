import { useSelector } from "react-redux";
import * as React from "react";
import {
	usePatchRequestMutation,
	usePostRequestMutation,
} from "../services/api/request";
import { ENDPOINT } from "../constants/endpoint";
import { toast } from "sonner";
import { invalidateRequestTag } from "../services/api/invalidate-request-tag";
import { validateForm } from "../helpers/validate-form";

export const useProfile = () => {
	const { user } = useSelector((state) => state.userSlice);
	const [formData, setFormData] = React.useState(user);

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		setFormData({
			...formData,
			[name]: files ? files[0] : value,
		});
	};

	const [patchProfileForm, { isLoading: isPatchProfileLoading }] =
		usePatchRequestMutation();
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Create a FormData object
		const formDataToSend = new FormData();

		// Append form fields to FormData
		Object.keys(formData).forEach((key) => {
			// Check if the field is a file (for profile_picture)
			if (key === "profile_picture" && formData[key] instanceof File) {
				formDataToSend.append(key, formData[key]);
			}
			// Append other fields (non-file) normally
			else if (key !== "profile_picture") {
				formDataToSend.append(key, formData[key]);
			}
		});

		try {
			const res = await patchProfileForm({
				url: ENDPOINT.PATCH_ADMIN_PROFILE,
				body: formDataToSend,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_ADMIN_CREDENTIALS);
		} catch (err) {
			console.error(err);
		}
	};

	const [modal, setModal] = React.useState({
		open: false,
		type: "",
	});

	const [credentials, setCredentials] = React.useState({
		user: user.id,
		current_password: "",
		new_password: "",
	});

	const handleOpenModal = (type = "account") => {
		setModal((prev) => ({
			open: true,
			type,
		}));
	};

	const handleCloseModal = () => {
		setModal((prev) => ({
			open: false,
			type: "",
		}));
		setCredentials({
			user: user.id,
			current_password: "",
			new_password: "",
		});
	};

	const [patchPassword, { isLoading: patchingAccountPassword }] =
		usePostRequestMutation();
	const handleUpdateAcccountPassword = async () => {
		try {
			if (!validateForm(credentials, ["user"])) return;

			const res = await patchPassword({
				url:
					modal.type === "account"
						? ENDPOINT.POST_ACCOUNT_PASSWORD
						: ENDPOINT.POST_WITHDRAWAL_PASSWORD,
				body: credentials,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_ADMIN_CREDENTIALS);
			handleCloseModal();
		} catch (err) {
			console.error(err);
		}
	};

	return {
		formData,
		handleChange,
		handleSubmit,
		isPatchProfileLoading,

		patchingAccountPassword,
		handleUpdateAcccountPassword,
		credentials,
		setCredentials,

		modal,
		handleOpenModal,
		handleCloseModal,
	};
};
