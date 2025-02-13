export const getEnv = (key = "", defaultValue = null) => {
	const value = import.meta.env[key];
	if (!value && defaultValue) {
		console.warn(
			`Environment variable ${key} not set, using default: ${defaultValue}`,
		);
	}
	return value || defaultValue;
};
