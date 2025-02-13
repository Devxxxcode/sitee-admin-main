import { AiOutlineLoading } from "react-icons/ai";
import { Error } from "../../components/error";
import { Loading } from "../../components/loading";
import { useSetting } from "../../hooks/use-setting";

const Settings = () => {
	const {
		handleChange,
		settingsData,
		handleSubmit,
		settings,
		isUpdatingSettings,
	} = useSetting();

	if (settingsData.isLoading) {
		return <Loading />;
	}

	if (settingsData.isError) {
		return <Error />;
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 md:p-6">
			<div className="w-full p-6 bg-white rounded-lg shadow-lg max-w-7xl">
				<h1 className="mb-6 text-2xl font-semibold text-gray-700">
					Settings Management
				</h1>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Percentage of sponsors
						</label>
						<input
							type="number"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.percentage_of_sponsors}
							onChange={(e) =>
								handleChange("percentage_of_sponsors", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Token validity period in hours
						</label>
						<input
							type="number"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.token_validity_period_hours}
							onChange={(e) =>
								handleChange(
									"token_validity_period_hours",
									e.target.value,
								)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Bonus when registering in USD
						</label>
						<input
							type="number"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.bonus_when_registering}
							onChange={(e) =>
								handleChange("bonus_when_registering", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Service availability start time
						</label>
						<input
							type="time"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.service_availability_start_time}
							onChange={(e) =>
								handleChange(
									"service_availability_start_time",
									e.target.value,
								)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Service availability end time
						</label>
						<input
							type="time"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.service_availability_end_time}
							onChange={(e) =>
								handleChange(
									"service_availability_end_time",
									e.target.value,
								)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							WhatsApp Contact
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.whatsapp_contact}
							onChange={(e) =>
								handleChange("whatsapp_contact", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Telegram Contact
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.telegram_contact}
							onChange={(e) =>
								handleChange("telegram_contact", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Time Zone
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.timezone}
							onChange={(e) => handleChange("timezone", e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							ERC
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.erc_address}
							onChange={(e) =>
								handleChange("erc_address", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							TRC
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.trc_address}
							onChange={(e) =>
								handleChange("trc_address", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Minimum balance for submissions
						</label>
						<input
							type="number"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.minimum_balance_for_submissions}
							onChange={(e) =>
								handleChange(
									"minimum_balance_for_submissions",
									e.target.value,
								)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Telegram User Name
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.telegram_username}
							onChange={(e) =>
								handleChange("telegram_username", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Online Chat Url
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.online_chat_url}
							onChange={(e) =>
								handleChange("online_chat_url", e.target.value)
							}
						/>
					</div>
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Online Embeded Chat Url
						</label>
						<input
							type="text"
							className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
							value={settings.online_embed_url}
							onChange={(e) =>
								handleChange("online_embed_url", e.target.value)
							}
						/>
					</div>
				</div>

				<div className="flex justify-end mt-8">
					<button
						className="flex items-center gap-2 px-6 py-3 text-lg text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700"
						onClick={handleSubmit}
					>
						{isUpdatingSettings && (
							<AiOutlineLoading className="animate-spin" />
						)}
						Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default Settings;
