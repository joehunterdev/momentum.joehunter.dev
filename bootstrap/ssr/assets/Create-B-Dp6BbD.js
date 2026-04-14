import { t as Authenticated } from "./AuthenticatedLayout-Boxls7xi.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { t as MomentModal } from "./moments-DKp5PxC1.js";
import { Head, router } from "@inertiajs/react";
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
			/* @__PURE__ */ jsx(MomentModal, {
				show: true,
				onClose: () => router.visit(route("weekly")),
				onSubmit: handleSubmit,
				submitLabel: "Create Moment"
			})
		]
	});
}
//#endregion
export { Create as default };
