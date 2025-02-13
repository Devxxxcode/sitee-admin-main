import { AiOutlineLoading } from "react-icons/ai";
import { useProfile } from "../../hooks/use-profile";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";

const Profile = () => {
	const {
		formData,
		handleChange,
		handleSubmit,
		isPatchProfileLoading,

		// Patch
		credentials,
		setCredentials,
		handleUpdateAcccountPassword,
		patchingAccountPassword,

		// Modal
		handleCloseModal,
		handleOpenModal,
		modal,
	} = useProfile();

	return (
		<div className="flex flex-col items-center">
			<div className="w-full p-6 bg-white rounded-lg shadow-lg max-w-7xl">
				<h2 className="mb-6 text-2xl font-bold text-gray-700">Profile</h2>
				<form
					onSubmit={handleSubmit}
					className="grid items-end gap-6 md:grid-cols-2"
				>
					{/* Name */}
					<div>
						<label className="text-sm font-semibold text-gray-600">
							User Name
						</label>
						<input
							type="text"
							name="username"
							value={formData.username}
							onChange={handleChange}
							className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Firstname */}
					<div>
						<label className="text-sm font-semibold text-gray-600">
							First Name
						</label>
						<input
							type="text"
							name="first_name"
							value={formData.first_name}
							onChange={handleChange}
							className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Lastname */}
					<div>
						<label className="text-sm font-semibold text-gray-600">
							Last Name
						</label>
						<input
							type="text"
							name="last_name"
							value={formData.last_name}
							onChange={handleChange}
							className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Phone */}
					<div>
						<label className="text-sm font-semibold text-gray-600">
							Phone Number
						</label>
						<input
							type="text"
							name="phone_number"
							value={formData.phone_number}
							onChange={handleChange}
							className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Email */}
					<div>
						<label className="text-sm font-semibold text-gray-600">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Profile Picture */}
					<div className="col-span-1">
						{formData.profile_picture && (
							<img
								src={
									formData.profile_picture instanceof File
										? URL.createObjectURL(formData.profile_picture)
										: formData.profile_picture
								}
								alt="profile"
								className="w-10 h-10 mb-2"
							/>
						)}

						<label className="text-sm font-semibold text-gray-600">
							Profile picture
						</label>

						<input
							type="file"
							name="profile_picture"
							onChange={handleChange}
							className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{/* Password Updates */}
					<div className="flex flex-wrap justify-end col-span-2 gap-6 my-4">
						<Button
							size="large"
							variant="contained"
							color="info"
							onClick={() => handleOpenModal("account")}
						>
							Update Account Password
						</Button>

						<Button
							size="large"
							variant="outlined"
							color="secondary"
							onClick={() => handleOpenModal("withdrawal")}
						>
							Update Withdrawal Password
						</Button>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						variant="contained"
						color="primary"
						size="large"
						className="flex items-center justify-center w-full col-span-2 gap-2 mx-auto"
					>
						{isPatchProfileLoading && (
							<AiOutlineLoading className="animate-spin" />
						)}
						Save
					</Button>
				</form>
			</div>

			<Dialog open={modal.open} onClose={handleCloseModal} fullWidth>
				<DialogTitle>
					{modal.type === "account"
						? "Update Account Password"
						: "Update Withdrawal Password"}
				</DialogTitle>

				<DialogContent className="grid grid-cols-2 gap-4">
					<TextField
						label="Current Password"
						fullWidth
						margin="normal"
						variant="outlined"
						value={credentials.current_password}
						onChange={(e) =>
							setCredentials({
								...credentials,
								current_password: e.target.value,
							})
						}
					/>

					<TextField
						label="New Password"
						fullWidth
						margin="normal"
						variant="outlined"
						value={credentials.new_password}
						onChange={(e) =>
							setCredentials({
								...credentials,
								new_password: e.target.value,
							})
						}
					/>
				</DialogContent>

				<DialogActions>
					<Button
						disabled={patchingAccountPassword}
						onClick={handleCloseModal}
						variant="outlined"
						color="warning"
					>
						Close
					</Button>

					<Button
						disabled={patchingAccountPassword}
						onClick={handleUpdateAcccountPassword}
						variant="contained"
						color="primary"
						sx={{
							gap: "10px",
						}}
					>
						{patchingAccountPassword && (
							<AiOutlineLoading className="animate-spin" />
						)}
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Profile;
