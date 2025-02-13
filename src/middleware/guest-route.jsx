import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { home } from "../constants/app.routes";
import * as React from "react";

export const GuestRoute = ({ children }) => {
	const { user } = useSelector((state) => state.userSlice);

	React.useEffect(() => {
		if (user?.access_token) {
			// Redirect to the home route if the user is authenticated
			<Navigate to={home} />;
		}
	}, [user?.access_token]);

	return !user?.access_token ? children : <Navigate to={home} />;
};
