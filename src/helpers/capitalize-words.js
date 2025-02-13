export const capitalizeWord = (word = "") => {
	// Check if the word is non-empty
	if (!word) return "";

	// Capitalize the first letter and make the rest lowercase
	return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
