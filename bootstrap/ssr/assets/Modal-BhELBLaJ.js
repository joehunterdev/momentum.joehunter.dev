import { jsx, jsxs } from "react/jsx-runtime";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
//#region resources/js/Components/SecondaryButton.tsx
function SecondaryButton({ type = "button", className = "", disabled, children, ...props }) {
	return /* @__PURE__ */ jsx("button", {
		...props,
		type,
		className: `inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 ${disabled && "opacity-25"} ` + className,
		disabled,
		children
	});
}
//#endregion
//#region resources/js/Components/Modal.tsx
function Modal({ children, show = false, maxWidth = "2xl", closeable = true, onClose = () => {} }) {
	const close = () => {
		if (closeable) onClose();
	};
	const maxWidthClass = {
		sm: "sm:max-w-sm",
		md: "sm:max-w-md",
		lg: "sm:max-w-lg",
		xl: "sm:max-w-xl",
		"2xl": "sm:max-w-2xl"
	}[maxWidth];
	return /* @__PURE__ */ jsx(Transition, {
		show,
		leave: "duration-200",
		children: /* @__PURE__ */ jsxs(Dialog, {
			as: "div",
			id: "modal",
			className: "fixed inset-0 z-50 flex transform items-center justify-center overflow-y-auto px-4 py-6 transition-all sm:px-6",
			onClose: close,
			children: [/* @__PURE__ */ jsx(TransitionChild, {
				enter: "ease-out duration-300",
				enterFrom: "opacity-0",
				enterTo: "opacity-100",
				leave: "ease-in duration-200",
				leaveFrom: "opacity-100",
				leaveTo: "opacity-0",
				children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gray-500/75" })
			}), /* @__PURE__ */ jsx(TransitionChild, {
				enter: "ease-out duration-300",
				enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
				enterTo: "opacity-100 translate-y-0 sm:scale-100",
				leave: "ease-in duration-200",
				leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
				leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
				children: /* @__PURE__ */ jsx(DialogPanel, {
					className: `mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full ${maxWidthClass}`,
					children
				})
			})]
		})
	});
}
//#endregion
export { SecondaryButton as n, Modal as t };
