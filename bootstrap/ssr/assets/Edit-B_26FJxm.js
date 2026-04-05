import { t as Authenticated } from "./AuthenticatedLayout-Se8rC2mR.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { t as MomentForm } from "./moments-tVP8K7NU.js";
import { n as Modal, r as DangerButton, t as SecondaryButton } from "./SecondaryButton-D-fA_blG.js";
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
			/* @__PURE__ */ jsx("div", {
				className: "py-8",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-2xl px-4 sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(MomentForm, {
						moment,
						onSubmit: handleSubmit,
						submitLabel: "Save Changes"
					})
				})
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
