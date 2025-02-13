import { toast } from "sonner";
import { capitalizeWord } from "./capitalize-words";

/**
 * Custom form validation function.
 *
 * @param {Object} formObject - The object representing the form fields.
 * @param {Array} optionalFields - An array of keys in the form object that are not required.
 *
 * @returns {Object} {
 *   isValid: Boolean,  // True if form is valid, false otherwise.
 *   errors: Array      // Array of field names that failed validation.
 * }
 */
export const validateForm = (formObject = {}, optionalFields = []) => {
	let isValidForm = true;

	const friendlyOptionalField = `(${optionalFields
		.map((field) => capitalizeWord(field.replace("_", " ")))
		.join(", ")})`;

	if (!formObject || !Object.keys(formObject).length) {
		toast.error(
			`All fields ${optionalFields.length > 0 ? `except ${friendlyOptionalField}` : ""} are required.`,
		);

		console.error(
			"`formObject` param is missing in the function validateForm.",
		);
		return false;
	}

	if (typeof formObject !== "object") {
		console.log("The param `formObject` should be of type object");
		return false;
	}

	Object.keys(formObject).forEach((field) => {
		if (
			!optionalFields.includes(field) &&
			(formObject[field] === "" ||
				formObject[field] === null ||
				formObject[field] === undefined)
		) {
			const userFriendlyField = capitalizeWord(field.replace(/_/g, " "));
			toast.error(`${userFriendlyField} is required.`);
			return (isValidForm = false);
		}
	});

	return isValidForm;
};
