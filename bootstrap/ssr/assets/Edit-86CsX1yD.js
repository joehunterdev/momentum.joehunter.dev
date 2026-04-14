import { t as Authenticated } from "./AuthenticatedLayout-Boxls7xi.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { n as SecondaryButton, t as Modal } from "./Modal-BmDisV1p.js";
import { t as MomentModal } from "./moments-TfAPYsdV.js";
import { t as DangerButton } from "./DangerButton-B54gxiV0.js";
import { Head, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
//#region resources/js/Pages/Moments/Edit.tsx
function Edit({ moment }) {
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	function handleSubmit(_data, form) {
		form.put(route("moments.update", moment.id), { onError: () => {} });
	}
	function handleDelete() {
		router.delete(route("moments.destroy", moment.id), { onFinish: () => setConfirmingDelete(false) });
	}
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-xl font-semibold text-gray-800",
				children: "Edit Moment"
			}), /* @__PURE__ */ jsx(DangerButton, {
				type: "button",
				onClick: () => setConfirmingDelete(true),
				className: "text-sm",
				children: "Delete"
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: `Edit: ${moment.name}` }),
			/* @__PURE__ */ jsx(FlashMessage, {}),
			/* @__PURE__ */ jsx(MomentModal, {
				show: true,
				onClose: () => router.visit(route("weekly")),
				moment,
				onSubmit: handleSubmit
			}),
			/* @__PURE__ */ jsx(Modal, {
				show: confirmingDelete,
				onClose: () => setConfirmingDelete(false),
				children: /* @__PURE__ */ jsxs("div", {
					className: "p-6",
					children: [
						/* @__PURE__ */ jsxs("h2", {
							className: "text-lg font-semibold text-gray-900",
							children: [
								"Delete \"",
								moment.name,
								"\"?"
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm text-gray-600",
							children: "This will archive the moment and all its history. This action cannot be undone."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex justify-end gap-3",
							children: [/* @__PURE__ */ jsx(SecondaryButton, {
								onClick: () => setConfirmingDelete(false),
								children: "Cancel"
							}), /* @__PURE__ */ jsx(DangerButton, {
								onClick: handleDelete,
								children: "Delete Moment"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Edit as default };
