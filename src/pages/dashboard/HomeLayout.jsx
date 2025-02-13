import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsFillArrowDownCircleFill } from "react-icons/bs";
import { RiMenuFoldFill } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";
import { GiEgyptianProfile } from "react-icons/gi";
import { useState } from "react";
import SideBarWeb from "./components/SideBarWeb";
import { BiBell, BiChevronDown } from "react-icons/bi";
import profilePic from "../../assets/profile-pic.jpg";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeIn } from "../../motion";
import { handleLogout } from "../../helpers/handle-logout";
import { useSelector } from "react-redux";
import { useNotification } from "../../hooks/use-notification";
import moment from "moment";
import { AiOutlineLoading } from "react-icons/ai";

const HomeLayout = () => {
	const navigate = useNavigate();

	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false); // New state for mobile sidebar
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const [isNotificationVisible, setIsNotificationVisible] = useState(false);

	const { user } = useSelector((state) => state.userSlice);

	const goToProfile = () => {
		navigate("/home/profile");
	};

	const handleNotificationClick = () => {
		setIsNotificationVisible(false);
		navigate("/home/notifications");
	};

	const { notifications, handleMarkAllAsRead, markingAllAsRead } =
		useNotification();

	// Function to toggle notification visibility
	const toggleNotificationPopup = () => {
		setIsNotificationVisible(!isNotificationVisible);
	};

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (!event.target.closest(".dropdown") && isDropdownVisible) {
				setIsDropdownVisible(false);
			}
			if (!event.target.closest(".notification") && isNotificationVisible) {
				setIsNotificationVisible(false);
			}
		};

		document.addEventListener("click", handleOutsideClick);
		return () => {
			document.removeEventListener("click", handleOutsideClick);
		};
	}, [isDropdownVisible, isNotificationVisible]);

	const toggleSidebar = () => {
		setIsSidebarCollapsed(!isSidebarCollapsed);
	};

	const toggleMobileSidebar = () => {
		setIsSidebarOpenOnMobile(!isSidebarOpenOnMobile); // Toggle sidebar visibility on mobile
	};

	const toggleDropdown = () => {
		setIsDropdownVisible(!isDropdownVisible);
	};

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50">
			{/* Sidebar */}
			<div
				className={`transition-all duration-300 ${
					isSidebarCollapsed ? "w-16" : "w-64"
				} !bg-red-200 text-white hidden md:block`} // Sidebar hidden by default on mobile
			>
				<SideBarWeb isCollapsed={isSidebarCollapsed} />
			</div>

			{/* Mobile Sidebar */}
			<div
				className={`fixed top-0 left-0 h-screen !bg-red-200 text-white z-50 transform transition-transform duration-300 ${
					isSidebarOpenOnMobile ? "translate-x-0" : "-translate-x-full"
				} md:hidden`} // Use `translate-x-full` to hide sidebar on mobile
			>
				<SideBarWeb
					isCollapsed={false}
					closeSidebar={() => setIsSidebarOpenOnMobile(false)}
				/>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-col w-full h-full">
				{/* Top Navigation */}
				<div className="flex items-center justify-between h-16 px-4 bg-white">
					{/* Sidebar Toggle for Mobile */}
					<button
						onClick={toggleMobileSidebar}
						className="text-gray-600 hover:text-gray-800 focus:outline-none md:hidden"
					>
						<RiMenuFoldFill className="text-2xl" />
					</button>

					{/* Sidebar Toggle for Desktop */}
					<button
						onClick={toggleSidebar}
						className="hidden text-gray-600 hover:text-gray-800 focus:outline-none md:block"
					>
						<RiMenuFoldFill className="text-2xl" />
					</button>

					<div className="flex items-center">
						{/* Notification Icon */}
						<div className="relative mr-4 notification">
							<button
								onClick={toggleNotificationPopup}
								className={`text-gray-600 hover:text-gray-800 ${notifications?.data && notifications?.data.filter((item) => !item?.is_read).length > 0 ? "shake" : ""}`}
							>
								<BiBell className="text-2xl" />

								{notifications?.data &&
									notifications?.data.filter((item) => !item?.is_read)
										.length > 0 && (
										<span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
											{
												notifications?.data.filter(
													(item) => !item?.is_read,
												).length
											}
										</span>
									)}
							</button>

							{isNotificationVisible && (
								<motion.div
									variants={fadeIn}
									initial={fadeIn("right", null).initial}
									whileInView={fadeIn("right", 1 * 2).animate}
									className="absolute right-0 z-50 mt-2 bg-white rounded-lg shadow-md w-80"
								>
									<h3 className="px-6 py-4 font-semibold text-gray-700 text-md">
										NOTIFICATIONS
									</h3>

									{/* Scrollable Notifications Section */}
									<div className="px-6 space-y-4 overflow-y-auto max-h-64">
										{notifications?.data &&
										notifications.data.length > 0 ? (
											notifications?.data.map(
												(notification, index) => (
													<motion.div
														key={notification.id}
														variants={fadeIn} // Reuse fadeIn for each notification
														initial={
															fadeIn("right", null).initial
														}
														whileInView={
															fadeIn("right", 1 * 2).animate
														}
														exit="hidden"
														onClick={handleNotificationClick}
														transition={{
															delay: index * 0.1,
															duration: 0.3,
														}} // Add staggered effect
														className="flex items-start cursor-pointer"
													>
														<span className="relative mt-1 text-red-500">
															<BiBell className="text-xl" />
														</span>

														<div className="relative ml-3">
															<p className="text-sm font-semibold text-gray-700">
																{notification?.title}

																{!notification?.is_read && (
																	<span className="bg-blue-500 absolute top-2 ml-2 rounded-full size-1.5" />
																)}
															</p>

															<p className="text-sm text-gray-700">
																{notification?.message}
															</p>

															<p className="text-xs text-gray-500">
																{moment(
																	notification.created_at,
																).fromNow()}
															</p>
														</div>
													</motion.div>
												),
											)
										) : (
											<p className="mt-6 mb-10 text-center text-gray-700">
												You don't have any notifications at the
												moment. Stay tuned for updates!
											</p>
										)}
									</div>

									{/* Fixed Reset Button */}
									<div className="px-6 py-4 mt-3 border-t">
										<button
											disabled={markingAllAsRead}
											onClick={handleMarkAllAsRead}
											className="flex items-center gap-2 mx-auto mt-4 text-sm text-blue-600 hover:underline"
										>
											{markingAllAsRead && (
												<AiOutlineLoading className="animate-spin" />
											)}
											<BsFillArrowDownCircleFill />
											Reset
										</button>
									</div>
								</motion.div>
							)}
						</div>

						{/* Admin Dropdown */}
						<div className="relative z-50 dropdown">
							<button
								className="flex items-center text-gray-600 hover:text-gray-800"
								onClick={toggleDropdown}
							>
								<img
									src={
										user?.profile_picture
											? user?.profile_picture
											: "/empty-user.jpg"
									}
									alt="Admin Profile"
									className="w-8 h-8 mr-2 rounded-full"
								/>
								<span className="hidden ml-2 md:inline-block">
									{user?.username}
								</span>
								<BiChevronDown className="ml-1" />
							</button>

							{isDropdownVisible && (
								<div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-lg shadow-md">
									{/* Update Profile */}
									<button
										onClick={goToProfile}
										className="flex items-center w-full px-4 py-2 space-x-2 text-left text-gray-700 text-md hover:bg-gray-100"
									>
										<GiEgyptianProfile className="text-lg text-gray-500" />
										<span>Update profile</span>
									</button>

									{/* Divider */}
									<hr className="my-1 border-gray-200" />

									{/* Logout */}
									<button
										onClick={handleLogout}
										className="flex items-center w-full px-4 py-2 space-x-2 text-left text-gray-700 text-md hover:bg-gray-100"
									>
										<FiLogOut className="text-lg text-gray-500" />
										<span>Logout</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 overflow-y-auto bg-gray-100 md:p-4">
					<Outlet />
				</div>
			</div>

			{/* Overlay for Mobile Sidebar */}
			{isSidebarOpenOnMobile && (
				<div
					className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
					onClick={toggleMobileSidebar} // Close sidebar when clicking on the overlay
				></div>
			)}
		</div>
	);
};

export default HomeLayout;
