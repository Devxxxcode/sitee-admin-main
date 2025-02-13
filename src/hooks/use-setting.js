import * as React from "react";
import {
	useGetRequestQuery,
	usePatchRequestMutation,
} from "../services/api/request";
import { ENDPOINT } from "../constants/endpoint";
import { convertToFormData } from "../helpers/convert-to-form-data";
import { validateForm } from "../helpers/validate-form";
import { toast } from "sonner";
import { invalidateRequestTag } from "../services/api/invalidate-request-tag";

export const useSetting = () => {
	const [settings, setSettings] = React.useState({
		percentage_of_sponsors: "",
		bonus_when_registering: "",
		service_availability_start_time: "",
		service_availability_end_time: "",
		token_validity_period_hours: "",
		whatsapp_contact: "",
		telegram_contact: "",
		timezone: "",
		erc_address: "",
		trc_address: "",
		minimum_balance_for_submissions: "",
		telegram_username: "",
		online_chat_url: "",
		video: null,
		online_embed_url: ""
	});

	const {
		data: settingsRes,
		isLoading: isLoadingSettings,
		isError: isSettingsError,
	} = useGetRequestQuery(
		{
			url: ENDPOINT.GET_SETTINGS,
		},
		{
			refetchOnMountOrArgChange: true,
		},
	);

	React.useEffect(() => {
		if (settingsRes) {
			setSettings(settingsRes?.data);
		}
	}, [settingsRes]);

	const settingsData = {
		data: settingsRes,
		isLoading: isLoadingSettings,
		isError: isSettingsError,
	};

	const handleChange = (field, value) => {
		setSettings((prevSettings) => ({
			...prevSettings,
			[field]: value,
		}));
	};

	const [updateSettings, { isLoading: isUpdatingSettings }] =
		usePatchRequestMutation();

	const handleSubmit = async () => {
		try {
			const { video, ...formValues } = settings;
			const isValidForm = validateForm(formValues);

			if (!isValidForm) return;

			const formData = convertToFormData(settings, ["video"]);

			const res = await updateSettings({
				url: ENDPOINT.PATCH_SETTINGS,
				body: formData,
			}).unwrap();

			toast.success(res?.message);
			invalidateRequestTag(ENDPOINT.GET_SETTINGS);
		} catch (err) {
			console.error(err);
		}
	};

	return {
		settings,
		settingsData,
		handleSubmit,
		handleChange,
		isUpdatingSettings,
	};
};
