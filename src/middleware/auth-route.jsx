import { VscLoading } from "react-icons/vsc";
import { Navigate } from "react-router-dom";
import { homepage } from "../constants/app.routes";
import { useDispatch, useSelector } from "react-redux";
import * as React from "react";
import { handleLogout } from "../helpers/handle-logout";
import { useGetRequestQuery } from "../services/api/request";
import { ENDPOINT } from "../constants/endpoint";
import { setUser } from "../services/slices/user-slice";
import { Loading } from "../components/loading";

export const AuthRoute = ({ children }) => {
	const dispatch = useDispatch();
	const { user, sessionExpired } = useSelector((state) => state.userSlice);

	React.useLayoutEffect(() => {
		const sessionValidate = async () => {
			if (sessionExpired || !user?.refresh_token) {
				handleLogout();
				return <Navigate to={homepage} />;
			}
		};

		sessionValidate();
	}, [sessionExpired, user?.refresh_token]);

	// Get the user data;
	const { data: userCredentials, isLoading } = useGetRequestQuery(
		{
			url: ENDPOINT.GET_ADMIN_CREDENTIALS,
		},
		{
			skip: !user?.access_token || !user?.refresh_token,
		},
	);

	// Set the user Credentials when we get it
	React.useEffect(() => {
		if (userCredentials) {
			dispatch(
				setUser({
					access_token: user?.access_token,
					refresh_token: user?.refresh_token,
					...userCredentials?.data,
				}),
			);
		}
	}, [userCredentials]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loading />
			</div>
		);
	}

	return user?.refresh_token ? children : <Navigate to={homepage} />;
};
