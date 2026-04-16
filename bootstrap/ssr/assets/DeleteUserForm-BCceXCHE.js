import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as TextInput_default } from "./TextInput-DWxxor5z.js";
import { n as SecondaryButton, t as Modal } from "./Modal-BmDisV1p.js";
import { useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
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
//#region resources/js/Pages/Profile/Partials/DeleteUserForm.tsx
function DeleteUserForm({ className = "" }) {
	const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
	const passwordInput = useRef(null);
	const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: "" });
	const confirmUserDeletion = () => {
		setConfirmingUserDeletion(true);
	};
	const deleteUser = (e) => {
		e.preventDefault();
		destroy(route("profile.destroy"), {
			preserveScroll: true,
			onSuccess: () => closeModal(),
			onError: () => passwordInput.current?.focus(),
			onFinish: () => reset()
		});
	};
	const closeModal = () => {
		setConfirmingUserDeletion(false);
		clearErrors();
		reset();
	};
	return /* @__PURE__ */ jsxs("section", {
		className: `space-y-6 ${className}`,
		children: [
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-medium text-gray-900",
				children: "Delete Account"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-gray-600",
				children: "Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain."
			})] }),
			/* @__PURE__ */ jsx(DangerButton, {
				onClick: confirmUserDeletion,
				children: "Delete Account"
			}),
			/* @__PURE__ */ jsx(Modal, {
				show: confirmingUserDeletion,
				onClose: closeModal,
				children: /* @__PURE__ */ jsxs("form", {
					onSubmit: deleteUser,
					className: "p-6",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-lg font-medium text-gray-900",
							children: "Are you sure you want to delete your account?"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-gray-600",
							children: "Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6",
							children: [
								/* @__PURE__ */ jsx(InputLabel, {
									htmlFor: "password",
									value: "Password",
									className: "sr-only"
								}),
								/* @__PURE__ */ jsx(TextInput_default, {
									id: "password",
									type: "password",
									name: "password",
									ref: passwordInput,
									value: data.password,
									onChange: (e) => setData("password", e.target.value),
									className: "mt-1 block w-3/4",
									isFocused: true,
									placeholder: "Password"
								}),
								/* @__PURE__ */ jsx(InputError, {
									message: errors.password,
									className: "mt-2"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex justify-end",
							children: [/* @__PURE__ */ jsx(SecondaryButton, {
								onClick: closeModal,
								children: "Cancel"
							}), /* @__PURE__ */ jsx(DangerButton, {
								className: "ms-3",
								disabled: processing,
								children: "Delete Account"
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { DeleteUserForm as default };
