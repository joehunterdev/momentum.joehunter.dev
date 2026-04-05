import { usePage } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
//#region resources/js/shared/components/FlashMessage.tsx
function FlashMessage() {
	const { flash } = usePage().props;
	const [visible, setVisible] = useState(false);
	const [message, setMessage] = useState(null);
	useEffect(() => {
		if (flash?.success) {
			setMessage({
				type: "success",
				text: flash.success
			});
			setVisible(true);
		} else if (flash?.error) {
			setMessage({
				type: "error",
				text: flash.error
			});
			setVisible(true);
		} else {
			setVisible(false);
			setMessage(null);
		}
	}, [flash]);
	useEffect(() => {
		if (!visible) return;
		const timer = setTimeout(() => setVisible(false), 4e3);
		return () => clearTimeout(timer);
	}, [visible]);
	if (!visible || !message) return null;
	return /* @__PURE__ */ jsx("div", {
		className: `fixed right-4 top-4 z-50 max-w-sm rounded-md border px-4 py-3 shadow-md transition-opacity duration-300 ${message.type === "success" ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-red-400 text-red-800"}`,
		role: "alert",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-sm font-medium",
				children: message.text
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setVisible(false),
				className: "shrink-0 text-current opacity-60 hover:opacity-100",
				"aria-label": "Dismiss",
				children: "✕"
			})]
		})
	});
}
//#endregion
export { FlashMessage as t };
