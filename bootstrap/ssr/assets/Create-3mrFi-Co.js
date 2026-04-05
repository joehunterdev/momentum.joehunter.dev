import { t as Authenticated } from "./AuthenticatedLayout-Se8rC2mR.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { t as MomentForm } from "./moments-tVP8K7NU.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Moments/Create.tsx
function Create(_props) {
	function handleSubmit(_data, form) {
		form.post(route("moments.store"), { onError: () => {} });
	}
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx("h2", {
			className: "text-xl font-semibold text-gray-800",
			children: "New Moment"
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "New Moment" }),
			/* @__PURE__ */ jsx(FlashMessage, {}),
			/* @__PURE__ */ jsx("div", {
				className: "py-8",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-2xl px-4 sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(MomentForm, {
						onSubmit: handleSubmit,
						submitLabel: "Create Moment"
					})
				})
			})
		]
	});
}
//#endregion
export { Create as default };
