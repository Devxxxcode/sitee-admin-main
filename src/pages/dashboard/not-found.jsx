import * as React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { home, homepage } from "../../constants/app.routes";

export const NotFound = () => {
	const { user } = useSelector((state) => state.userSlice);

	return <Navigate to={user?.access_token ? home : homepage} />;
};
