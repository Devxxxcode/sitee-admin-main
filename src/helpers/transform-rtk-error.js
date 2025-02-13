import { toast } from "sonner";
import { capitalizeWord } from "./capitalize-words";

// 401, 419, and 403 is handled in the base-query
export const transformErrorResponse = (err) => {
	// Handle network errors
	if (err.status === "FETCH_ERROR") {
		toast.error("Network error. Please check your connection.");
		return err;
	}

	// Handle server-side errors (404)
	if (err.status === 404) {
		if (isErrorResponse(err.data)) {
			toast.error(`Error: ${err.data.statusMessage || "Invalid API"}`);
		} else {
			toast.error("Invalid API endpoint or resource not found.");
		}
		return err;
	}

	if (err.status === 401) {
		// Do nothing, it would be handled in base query with reauth
		return err;
	}

	// Handle other HTTP errors for all response type. Including Object, string, array
	if (typeof err.status === "number") {
		if (isErrorResponse(err.data)) {
			const serverErrorMessage =
				err.data?.message || err.data?.error || err.data?.detail;

			if (typeof serverErrorMessage === "string") {
				toast.error(serverErrorMessage);
			} else if (Array.isArray(serverErrorMessage)) {
				serverErrorMessage.forEach((msg) => toast.error(msg));
			} else if (typeof serverErrorMessage === "object") {
				Object.keys(serverErrorMessage).forEach((field) => {
					if (Array.isArray(serverErrorMessage[field])) {
						serverErrorMessage[field].map((msg) => {
							const friendlyKey = capitalizeWord(
								field.replaceAll("_", " "),
							);

							toast.error(`${friendlyKey}: ${msg}`);
						});
					} else {
						toast.error(serverErrorMessage[field]);
					}
				});
			} else {
				toast.error("An unknown error occured. Please try again later.");
			}
		} else {
			toast.error(
				"An unknown server error occurred. Please try again later.",
			);
		}
		return err;
	}

	// Fallback for unknown errors
	toast.error("An unknown error occurred. Please try again.");
	return err;
};

// Type guard to check if err.data is an ErrorResponse
function isErrorResponse(data) {
	console.log(data);
	return (
		typeof data === "object" &&
		data !== null &&
		("message" in data || "statusMessage" in data)
	);
}
