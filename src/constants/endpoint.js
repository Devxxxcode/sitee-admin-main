export const ENDPOINT = {
	// AUTH
	GET_REFRESHED_ACCESS_TOKEN: "/auth/refresh-token/",
	ADMIN_LOGIN: "/site_admin/auth/admin/login/",

	//PROFILE
	GET_ADMIN_CREDENTIALS: "/site_admin/auth/admin/me/",
	PATCH_ADMIN_PROFILE: "/auth/update_profile/",
	POST_ACCOUNT_PASSWORD: "/auth/user_change_password/",
	POST_WITHDRAWAL_PASSWORD: "/auth/user_change_transactional_password/",

	//DEPOSIT
	GET_DEPOSITS: "/site_admin/deposits/",
	EDIT_STATUS: "/site_admin/deposits/:id/update-status/",
	// EVENTS
	GET_EVENTS: "/site_admin/events/",
	POST_EVENTS: "/site_admin/events/",
	PUT_EVENT: "/site_admin/events/:id/",
	DELETE_EVENT: "/site_admin/events/:id/",

	// ANNOUNCEMENTS
	GET_ANNOUNCEMENTS: "/site_admin/announcements/",
	POST_ANNOUNCEMENT: "/site_admin/announcements/",
	PUT_ANNOUNCEMENT: "/site_admin/announcements/:id/",
	DELETE_ANNOUNCEMENT: "/site_admin/announcements/:id/",

	//SETTINGS
	GET_SETTINGS: "/site_admin/settings/",
	PATCH_SETTINGS: "/site_admin/settings/update-settings/",

	// Update Video
	POST_VIDEO: "/site_admin/settings/update-video/",

	// Packs
	GET_PACKS: "/api/packs/",
	ADD_PACKS: "/api/packs/",
	PATCH_PACKS: "/api/packs/:id/",
	DELETE_PACKS: "/api/packs/:id/",

	// PRODUCTS
	GET_PRODUCT: "/api/products/",
	ADD_PRODUCT: "/api/products/",
	PATCH_PRODUCT: "/api/products/:id/",
	DELETE_PRODUCT: "/api/products/:id/",

	// USERS
	GET_ALL_USERS: "/site_admin/users/",
	POST_GENERATE_CODE: "/auth/invitation-codes/generate-code/",
	UPDATE_LOGIN_PASSWORD: "/site_admin/users/update-login-password/",
	UPDATE_WITHDRAWAL_PASSWORD: "/site_admin/users/update-withdrawal-password/",
	UPDATE_CUSTOMER_BALANCE: "/site_admin/users/update-balance/",
	UPDATE_TODAY_PROFIT: "/site_admin/users/update-profit/",
	UPDATE_TODAY_SALARY: "/site_admin/users/update-salary/",
	UPDATE_REG_BONUS: "/site_admin/users/toggle-reg-bonus/",
	UPDATE_MIN_BALANCE: "/site_admin/users/toggle-min-balance/",
	POST_SEE_MORE_INFORMATION: "/site_admin/users/get_user_info/",
	POST_USER_ACTIVE: "/site_admin/users/toggle_user_active/",
	POST_UPDATE_CREDIT_SCORE: "/site_admin/users/update_credit_score/",
	POST_REST_ACCOUNT_FOR_TASK: "/site_admin/users/reset_user_account/",
	DELETE_USER: "/site_admin/users/delete-user/",

	// Negative Users
	GET_NEGATIVE_USERS: "/site_admin/negative-users/",
	PATCH_NEGATIVE_USER: "/site_admin/negative-users/:id/",
	ADD_NEGATIVE_USER: "/site_admin/negative-users/",
	DELETE_NEGATIVE_USER: "/site_admin/negative-users/:id/",

	// ON Hold
	GET_ON_HOLD: "/site_admin/onholds/",
	ADD_ON_HOLD: "/site_admin/onholds/",
	PATCH_ON_HOLD: "/site_admin/onholds/:id/",
	DELETE_HOLD: "/site_admin/onholds/:id/",

	// WITHDRAWALS
	GET_WITHDRAWALS: "/site_admin/withdrawals/",
	UPDATE_WITHDRAWAL: "/site_admin/withdrawals/:id/update-status/",

	// NOTIFICATION
	GET_NOTIFICATIONS: "/api/admin-notifications/",
	POST_MARK_ALL_NOTIFICATION_AS_READ:
		"/api/admin-notifications/mark-all-read/",
	POST_MARK_SINGLE_NOTIFICATION: "/api/admin-notifications/mark-read/",

	// LOGS
	GET_LOGS: "/api/admin-logs/",
};
