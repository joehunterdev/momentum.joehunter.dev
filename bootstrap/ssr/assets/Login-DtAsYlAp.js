import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-CzJZismR.js";
import { t as TextInput_default } from "./TextInput-DrClm5Kx.js";
import { t as Guest } from "./GuestLayout-yOb3-3jv.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Components/Checkbox.tsx
function Checkbox({ className = "", ...props }) {
	return /* @__PURE__ */ jsx("input", {
		...props,
		type: "checkbox",
		className: "rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 " + className
	});
}
//#endregion
//#region resources/js/Pages/Auth/Login.tsx
function Login({ status, canResetPassword }) {
	const { data, setData, post, processing, errors, reset } = useForm({
		email: "",
		password: "",
		remember: false
	});
	const submit = (e) => {
		e.preventDefault();
		post(route("login"), { onFinish: () => reset("password") });
	};
	return /* @__PURE__ */ jsxs(Guest, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Log in" }),
		status && /* @__PURE__ */ jsx("div", {
			className: "mb-4 text-sm font-medium text-green-600",
			children: status
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			children: [
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "email",
						value: "Email"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "email",
						type: "email",
						name: "email",
						value: data.email,
						className: "mt-1 block w-full",
						autoComplete: "username",
						isFocused: true,
						onChange: (e) => setData("email", e.target.value)
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.email,
						className: "mt-2"
					})
				] }),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4",
					children: [
						/* @__PURE__ */ jsx(InputLabel, {
							htmlFor: "password",
							value: "Password"
						}),
						/* @__PURE__ */ jsx(TextInput_default, {
							id: "password",
							type: "password",
							name: "password",
							value: data.password,
							className: "mt-1 block w-full",
							autoComplete: "current-password",
							onChange: (e) => setData("password", e.target.value)
						}),
						/* @__PURE__ */ jsx(InputError, {
							message: errors.password,
							className: "mt-2"
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-4 block",
					children: /* @__PURE__ */ jsxs("label", {
						className: "flex items-center",
						children: [/* @__PURE__ */ jsx(Checkbox, {
							name: "remember",
							checked: data.remember,
							onChange: (e) => setData("remember", e.target.checked || false)
						}), /* @__PURE__ */ jsx("span", {
							className: "ms-2 text-sm text-gray-600",
							children: "Remember me"
						})]
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex items-center justify-end",
					children: [canResetPassword && /* @__PURE__ */ jsx(Link, {
						href: route("password.request"),
						className: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
						children: "Forgot your password?"
					}), /* @__PURE__ */ jsx(PrimaryButton, {
						className: "ms-4",
						disabled: processing,
						children: "Log in"
					})]
				})
			]
		})
	] });
}
//#endregion
export { Login as default };
