import { jsx } from "react/jsx-runtime";
//#region resources/js/Components/PrimaryButton.tsx
function PrimaryButton({ className = "", disabled, children, ...props }) {
	return /* @__PURE__ */ jsx("button", {
		...props,
		className: `mm-btn-primary inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-widest transition duration-150 ease-in-out ${disabled && "opacity-25"} ` + className,
		disabled,
		children
	});
}
//#endregion
export { PrimaryButton as t };
