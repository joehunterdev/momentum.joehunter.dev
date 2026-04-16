import { t as Authenticated } from "./AuthenticatedLayout-DC0lLhG0.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Monthly/Index.tsx
function Index({ month, monthStart, monthEnd, days, config }) {
	return /* @__PURE__ */ jsxs(Authenticated, { children: [/* @__PURE__ */ jsx(Head, { title: "Monthly" }), /* @__PURE__ */ jsx("div", {
		className: "py-0 sm:py-6",
		children: /* @__PURE__ */ jsx("div", {
			className: "mx-auto max-w-5xl sm:px-6 lg:px-8",
			children: /* @__PURE__ */ jsxs("p", {
				className: "text-center text-gray-400 py-12",
				children: ["Monthly view coming soon — ", month]
			})
		})
	})] });
}
//#endregion
export { Index as default };
