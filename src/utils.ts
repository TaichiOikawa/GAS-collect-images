export const getPropertiesService = (propertyName: string) => {
	const propertyValue: string | null =
		PropertiesService.getScriptProperties().getProperty(propertyName);
	if (!propertyValue) {
		throw new Error(`Error: ${propertyName} is not defined.`);
	}
	return propertyValue;
};
