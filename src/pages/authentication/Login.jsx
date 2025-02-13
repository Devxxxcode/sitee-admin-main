import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import logo from "../../assets/logo-light.png";
import { usePostRequestMutation } from "../../services/api/request";
import { ENDPOINT } from "../../constants/endpoint";
import { useDispatch } from "react-redux";
import { setUser } from "../../services/slices/user-slice";
import { toast } from "sonner";
import { validateForm } from "../../helpers/validate-form";
import { AiOutlineLoading } from "react-icons/ai";

const Login = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [showPopup, setShowPopup] = useState(false);
	const emailInputRef = useRef(null);
	const passwordInputRef = useRef(null);

	const [postLoginForm, { isLoading }] = usePostRequestMutation();
	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const formValues = {
				username_or_email: emailInputRef.current.value,
				password: passwordInputRef.current.value,
			};

			const isValidForm = validateForm(formValues);

			if (!isValidForm) return;

			const res = await postLoginForm({
				url: ENDPOINT.ADMIN_LOGIN,
				body: formValues,
			}).unwrap();

			setShowPopup(true);

			setTimeout(() => {
				setShowPopup(false);
				dispatch(
					setUser({
						access_token: res?.data?.access,
						refresh_token: res?.data?.refresh,
					}),
				);
			}, 2000);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[#edded34d] relative">
			{/* Logo Section */}
			<div className="mb-8 text-center">
				<img src={logo} alt="Adsterra Logo" className="h-20 mx-auto" />
			</div>

			{/* Card Section */}
			<div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
				<h5 className="mb-8 text-xl font-semibold text-center text-gray-700">
					Sign in to continue to Adsterra
				</h5>

				<form className="space-y-6" onSubmit={handleSubmit}>
					{/* Login Field */}
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							Login / Email
						</label>
						<input
							ref={emailInputRef}
							type="text"
							id="email"
							placeholder="Login / Email"
							className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							required
						/>
					</div>

					{/* Password Field */}
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<input
							ref={passwordInputRef}
							type="password"
							id="password"
							placeholder="Enter password"
							className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
							required
						/>
					</div>

					{/* Remember Me */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="remember"
							className="custom-checkbox"
						/>
						<label
							htmlFor="remember"
							className="ml-2 text-sm font-medium text-gray-700"
						>
							Remember me
						</label>
					</div>

					{/* Login Button */}
					<button
						type="submit"
						className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition duration-200 bg-red-600 rounded-md hover:bg-red-500"
					>
						{isLoading && <AiOutlineLoading className="animate-spin" />}
						Log In
					</button>
				</form>
			</div>

			{/* Success Popup */}
			{showPopup && (
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={{ duration: 0.3 }}
					className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50"
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1 }}
						className="w-full max-w-xs p-6 text-center bg-white rounded-lg shadow-lg"
					>
						<FaCheckCircle className="mx-auto mb-4 text-5xl text-green-500" />
						<h2 className="text-xl font-semibold text-gray-800">
							Login Successful!
						</h2>
						<p className="mt-2 mb-4 text-gray-600">
							You have successfully logged in.
						</p>
					</motion.div>
				</motion.div>
			)}
		</div>
	);
};

export default Login;
