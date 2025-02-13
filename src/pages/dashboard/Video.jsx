import { useEffect, useState } from "react";
import { validateForm } from "../../helpers/validate-form";
import { convertToFormData } from "../../helpers/convert-to-form-data";
import { ENDPOINT } from "../../constants/endpoint";
import { invalidateRequestTag } from "../../services/api/invalidate-request-tag";
import {
	useGetRequestQuery,
	usePostRequestMutation,
} from "../../services/api/request";
import { toast } from "sonner";
import { Loading } from "../../components/loading";
import { AiOutlineLoading } from "react-icons/ai";

const Video = () => {
	const [video, setVideo] = useState(null);

	const { data, isLoading } = useGetRequestQuery({
		url: ENDPOINT.GET_SETTINGS,
	});

	useEffect(() => {
		if (data) {
			setVideo(data?.data?.video);
		}
	}, [data]);

	const [patchVideo, { isLoading: isUpdatingVideo }] =
		usePostRequestMutation();
	const handleSubmit = async () => {
		try {
			const formValue = { video };
			const isValidForm = validateForm(formValue);

			if (!isValidForm) return;

			const formData = convertToFormData(formValue);

			const res = await patchVideo({
				url: ENDPOINT.POST_VIDEO,
				body: formData,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_SETTINGS);
		} catch (error) {
			console.error(error);
		}
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="flex items-center justify-center bg-gray-100 md:p-4">
			<form className="w-full p-2 bg-white rounded-lg shadow-lg max-w-7xl md:p-6">
				{/* Video Upload */}
				<div className={`space-y-2 ${video ? "col-span-2" : ""}`}>
					<label className="block text-lg font-medium text-gray-700">
						Video
					</label>

					{video && (
						<video
							src={
								video instanceof File
									? URL.createObjectURL(video)
									: video
							}
							controls
							className="max-h-[500px] rounded-md"
						>
							Your browser does not support the video tag.
						</video>
					)}

					<input
						type="file"
						accept="video/*"
						className="block w-full p-3 mt-2 text-lg border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
						onChange={(e) => setVideo(e.target.files[0])}
					/>
				</div>

				<div className="flex justify-end mt-8">
					<button
						disabled={isUpdatingVideo}
						className="px-6 py-3 text-lg text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-700"
						onClick={handleSubmit}
					>
						{isUpdatingVideo && (
							<AiOutlineLoading className="animate-spin" />
						)}
						Save
					</button>
				</div>
			</form>
		</div>
	);
};

export default Video;
