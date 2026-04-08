import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-BiUSTvAy.js";
import { t as TextInput_default } from "./TextInput-DWxxor5z.js";
import { useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { Transition } from "@headlessui/react";
//#region resources/js/Pages/Profile/Partials/UpdatePasswordForm.tsx
function UpdatePasswordForm({ className = "" }) {
	const passwordInput = useRef(null);
	const currentPasswordInput = useRef(null);
	const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
		current_password: "",
		password: "",
		password_confirmation: ""
	});
	const updatePassword = (e) => {
		e.preventDefault();
		put(route("password.update"), {
			preserveScroll: true,
			onSuccess: () => reset(),
			onError: (errors) => {
				if (errors.password) {
					reset("password", "password_confirmation");
					passwordInput.current?.focus();
				}
				if (errors.current_password) {
					reset("current_password");
					currentPasswordInput.current?.focus();
				}
			}
		});
	};
	return /* @__PURE__ */ jsxs("section", {
		className,
		children: [/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h2", {
			className: "text-lg font-medium text-gray-900",
			children: "Update Password"
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-sm text-gray-600",
			children: "Ensure your account is using a long, random password to stay secure."
		})] }), /* @__PURE__ */ jsxs("form", {
			onSubmit: updatePassword,
			className: "mt-6 space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "current_password",
						value: "Current Password"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "current_password",
						ref: currentPasswordInput,
						value: data.current_password,
						onChange: (e) => setData("current_password", e.target.value),
						type: "password",
						className: "mt-1 block w-full",
						autoComplete: "current-password"
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.current_password,
						className: "mt-2"
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "password",
						value: "New Password"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "password",
						ref: passwordInput,
						value: data.password,
						onChange: (e) => setData("password", e.target.value),
						type: "password",
						className: "mt-1 block w-full",
						autoComplete: "new-password"
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.password,
						className: "mt-2"
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "password_confirmation",
						value: "Confirm Password"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "password_confirmation",
						value: data.password_confirmation,
						onChange: (e) => setData("password_confirmation", e.target.value),
						type: "password",
						className: "mt-1 block w-full",
						autoComplete: "new-password"
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.password_confirmation,
						className: "mt-2"
					})
				] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ jsx(PrimaryButton, {
						disabled: processing,
						children: "Save"
					}), /* @__PURE__ */ jsx(Transition, {
						show: recentlySuccessful,
						enter: "transition ease-in-out",
						enterFrom: "opacity-0",
						leave: "transition ease-in-out",
						leaveTo: "opacity-0",
						children: /* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-600",
							children: "Saved."
						})
					})]
				})
			]
		})]
	});
}
//#endregion
export { UpdatePasswordForm as default };
