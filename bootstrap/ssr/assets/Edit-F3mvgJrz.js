import { t as Authenticated } from "./AuthenticatedLayout-C0YG6yYO.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { t as MomentModal } from "./moments-C8vf4Qmh.js";
import { Head, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Moments/Edit.tsx
function Edit({ moment }) {
	function handleSubmit(_data, form) {
		form.put(route("moments.update", moment.id), { onError: () => {} });
	}
	function handleDelete(m) {
		router.delete(route("moments.destroy", m.id));
	}
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx("h2", {
			className: "text-xl font-semibold text-gray-800",
			children: "Edit Moment"
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: `Edit: ${moment.name}` }),
			/* @__PURE__ */ jsx(FlashMessage, {}),
			/* @__PURE__ */ jsx(MomentModal, {
				show: true,
				onClose: () => router.visit(route("weekly")),
				moment,
				onSubmit: handleSubmit,
				onDelete: handleDelete
			})
		]
	});
}
//#endregion
export { Edit as default };
