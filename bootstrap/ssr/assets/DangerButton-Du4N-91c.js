import { jsx } from "react/jsx-runtime";
//#region resources/js/Components/DangerButton.tsx
function DangerButton({ className = "", disabled, children, ...props }) {
	return /* @__PURE__ */ jsx("button", {
		...props,
		className: `inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 ${disabled && "opacity-25"} ` + className,
		disabled,
		children
	});
}
//#endregion
export { DangerButton as t };
