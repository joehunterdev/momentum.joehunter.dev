import { jsx } from "react/jsx-runtime";
//#region resources/js/Components/InputError.tsx
function InputError({ message, className = "", ...props }) {
	return message ? /* @__PURE__ */ jsx("p", {
		...props,
		className: "text-sm text-red-600 " + className,
		children: message
	}) : null;
}
//#endregion
export { InputError as t };
