import { toast } from "sonner";
import { ENDPOINT } from "../constants/endpoint";
import { invalidateRequestTag } from "../services/api/invalidate-request-tag";
import {
	useDeleteRequestMutation,
	useGetRequestQuery,
	usePatchRequestMutation,
	usePostRequestMutation,
} from "../services/api/request";
import { validateForm } from "../helpers/validate-form";
import { capitalizeWord } from "../helpers/capitalize-words";

export const useAnnouncements = (modalType, closeModal) => {
	const {
		data: announcementData,
		isLoading: isLoadingAnnouncement,
		isError: isErrorAnnouncement,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_ANNOUNCEMENTS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	const announcements = {
		data: announcementData?.data,
		isLoading: isLoadingAnnouncement,
		isError: isErrorAnnouncement,
	};

	// Mutation hooks for POST and PATCH requests
	const [postAnnouncementForm, { isLoading: isAddingAnnouncement }] =
		usePostRequestMutation();
	const [putAnnouncementForm, { isLoading: isUpdatingAnnouncement }] =
		usePatchRequestMutation();

	// Helper function to handle error messages
	const handleErrorMessage = (error) => {
		const errorMessage = error?.data?.message || error?.data?.error || error?.data?.detail;

		if (typeof errorMessage === "string") {
			// Simple string error
			toast.error(errorMessage);
		} else if (Array.isArray(errorMessage)) {
			// Array of error messages
			errorMessage.forEach((msg) => toast.error(msg));
		} else if (typeof errorMessage === "object" && errorMessage !== null) {
			// Object with field-specific errors (like validation errors)
			Object.keys(errorMessage).forEach((field) => {
				if (Array.isArray(errorMessage[field])) {
					errorMessage[field].forEach((msg) => {
						const friendlyKey = capitalizeWord(field.replaceAll("_", " "));
						toast.error(`${friendlyKey}: ${msg}`);
					});
				} else {
					const friendlyKey = capitalizeWord(field.replaceAll("_", " "));
					toast.error(`${friendlyKey}: ${errorMessage[field]}`);
				}
			});
		} else {
			// Fallback error message
			toast.error("Failed to save announcement. Please check your input.");
		}
	};

	// Handle form submission (add or update)
	const handleAnnouncementFormSubmit = async (values) => {
		try {
			// Handle POST request for adding announcement
			if (modalType === "add") {
				const isValidForm = validateForm(values, ["id", "created_at", "updated_at"]);

				if (!isValidForm) return;

				await postAnnouncementForm({
					url: ENDPOINT.POST_ANNOUNCEMENT,
					body: values,
				}).unwrap();

				closeModal();
				toast.success("Announcement added successfully");
			}

			// Handle PATCH request for updating announcement
			if (modalType === "update") {
				const isValidForm = validateForm(values, ["id", "created_at", "updated_at"]);

				if (!isValidForm) return;

				await putAnnouncementForm({
					url: ENDPOINT.PUT_ANNOUNCEMENT.replace(":id", values?.id),
					body: values,
				}).unwrap();

				closeModal();
				toast.success("Announcement updated successfully");
			}

			invalidateRequestTag(ENDPOINT.GET_ANNOUNCEMENTS);
		} catch (error) {
			console.error("Error submitting announcement:", error);
			handleErrorMessage(error);
		}
	};

	const [deleteAnnouncement, { isLoading: isDeletingAnnouncement }] =
		useDeleteRequestMutation();
	const isLoadingAnnouncementForm =
		isAddingAnnouncement || isUpdatingAnnouncement || isDeletingAnnouncement;

	const handleDeleteAnnouncement = async (id = "") => {
		try {
			await deleteAnnouncement({
				url: ENDPOINT.DELETE_ANNOUNCEMENT.replace(":id", id),
			}).unwrap();

			toast.success("Announcement deleted successfully");
			invalidateRequestTag(ENDPOINT.GET_ANNOUNCEMENTS);
			closeModal();
		} catch (err) {
			console.error(err);
			handleErrorMessage(err);
		}
	};

	return {
		announcements,
		handleAnnouncementFormSubmit,
		isLoadingAnnouncementForm,
		handleDeleteAnnouncement,
	};
};

