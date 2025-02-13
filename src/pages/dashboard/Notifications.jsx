import { GoArrowLeft } from "react-icons/go";
import { motion } from "framer-motion";
import { useNotification } from "../../hooks/use-notification";
import { Loading } from "../../components/loading";
import { Error } from "../../components/error";
import { AiOutlineLoading } from "react-icons/ai";
import { useState } from "react";
import moment from "moment";

const Notification = () => {
	const { notifications, handleMarkAsRead, markingAsRead } = useNotification();

	if (notifications.isLoading) {
		return <Loading />;
	}

	if (notifications.isError) {
		return <Error />;
	}

	const [active, setActive] = useState();

	return (
		<div className="p-6">
			<button
				onClick={() => window.history.back()}
				className="flex items-center mb-6 text-lg text-blue-900"
			>
				<GoArrowLeft />
				<h2 className="ml-4 text-xl font-bold text-gray-800">
					Notifications
				</h2>
			</button>

			<p className="mb-4 text-gray-700">
				{notifications?.data.length} Notification(s)
			</p>

			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: 20 }}
				transition={{ duration: 0.7 }}
				className="space-y-4"
			>
				{/* If notification */}
				{notifications?.data &&
					notifications.data.length > 0 &&
					notifications.data.map((notif) => (
						<div
							key={notif.id}
							className={`bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-start md:items-center ${
								!notif.is_read ? "border-l-4 border-blue-900" : ""
							}`}
						>
							<div className="flex-1">
								<p className="text-justify text-gray-800">
									{notif.message}
								</p>
								<p className="mt-1 text-sm text-gray-500">
									{moment(notif?.created_at).fromNow()}
								</p>
								{!notif.is_read && (
									<p className="mt-1 text-sm text-blue-900">Unread</p>
								)}
							</div>
							{!notif.is_read && (
								<button
									disabled={markingAsRead && active === notif.id}
									onClick={() => {
										setActive(notif.id);
										handleMarkAsRead(notif.id);
									}}
									className="flex items-center gap-2 px-4 py-1 mt-3 text-sm font-semibold text-white bg-blue-900 rounded-full md:mt-0 md:ml-4"
								>
									{markingAsRead && active === notif.id && (
										<AiOutlineLoading className="animate-spin" />
									)}{" "}
									Mark as read
								</button>
							)}
						</div>
					))}

				{/* If no Notification */}
				{notifications.data && notifications.data.length === 0 && (
					<div className="flex items-center justify-center flex-grow gap-2 py-16">
						<h3 className="max-w-xs text-lg font-semibold text-center text-gray-500 text-pretty text-md">
							You don't have any notifications at the moment. Stay tuned
							for updates!
						</h3>
					</div>
				)}
			</motion.div>
		</div>
	);
};

export default Notification;
