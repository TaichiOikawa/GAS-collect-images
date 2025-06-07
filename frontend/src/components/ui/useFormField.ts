import * as React from "react";
import { useFormContext } from "react-hook-form";

type FormFieldContextType = { name?: string };
type FormItemContextType = { id?: string };

const FormFieldContext = React.createContext<FormFieldContextType>({});
const FormItemContext = React.createContext<FormItemContextType>({});

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);

	if (!fieldContext || !fieldContext.name) {
		throw new Error("useFormField should be used within <FormField>");
	}
	if (!itemContext || !itemContext.id) {
		throw new Error("useFormField should be used within <FormItem>");
	}

	const { getFieldState } = useFormContext();
	const fieldState = getFieldState(fieldContext.name);

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	};
};

export { FormFieldContext, FormItemContext, useFormField };
