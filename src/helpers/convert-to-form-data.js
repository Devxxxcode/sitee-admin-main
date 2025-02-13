/**
 * Converts a form object to FormData.
 *
 * @param {Object} formObject - The object containing form field values.
 * @param {Array} fileFields - An array of keys representing the file fields.
 *
 * @returns {FormData} - The FormData object with the form fields appended.
 */
export const convertToFormData = (formObject = {}, fileFields = []) => {
	const formData = new FormData();

	Object.keys(formObject).forEach((key) => {
		// Check if the key is a file field and is an instance of File
		if (fileFields.includes(key) && formObject[key] instanceof File) {
			formData.append(key, formObject[key]);
		}
		// If it's not a file, just append the field normally
		else if (!fileFields.includes(key)) {
			formData.append(key, formObject[key]);
		}
	});

	return formData;
};
