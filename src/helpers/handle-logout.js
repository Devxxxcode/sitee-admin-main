import { toast } from "sonner";
import { persistor, store } from "../services/store";
import { setSessionExpired } from "../services/slices/user-slice";

// Variable to track if logout has been handled
let isLogoutTriggered = false;

export const handleLogout = async () => {
	// If logout has already been triggered, skip further execution
	if (isLogoutTriggered) {
		return;
	}

	isLogoutTriggered = true;

	// Dispatch the session expiration action
	store.dispatch(setSessionExpired(true));
	// Wait for the purge operation to complete
	await persistor.purge();
	// Manually reset all Redux states
	store.dispatch({ type: "RESET_STATE" });
	// Restart persistence to ensure proper rehydration
	persistor.persist();

	// Show logout message
	toast.error("Your session has expired. Please log in again to continue.");

	// Reset the logout flag after one second to allow re-logout
	setTimeout(() => {
		isLogoutTriggered = false;
	}, 1000);
};
