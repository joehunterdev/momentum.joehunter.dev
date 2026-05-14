import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as PrimaryButton } from "./PrimaryButton-BiUSTvAy.js";
import { t as TextInput_default } from "./TextInput-DWxxor5z.js";
import { t as Guest } from "./GuestLayout-DT9g61qr.js";
import { Head, useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Auth/ForgotPassword.tsx
function ForgotPassword({ status }) {
	const { data, setData, post, processing, errors } = useForm({ email: "" });
	const submit = (e) => {
		e.preventDefault();
		post(route("password.email"));
	};
	return /* @__PURE__ */ jsxs(Guest, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Forgot Password" }),
		/* @__PURE__ */ jsx("div", {
			className: "mb-4 text-sm text-gray-600",
			children: "Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one."
		}),
		status && /* @__PURE__ */ jsx("div", {
			className: "mb-4 text-sm font-medium text-green-600",
			children: status
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			children: [
				/* @__PURE__ */ jsx(TextInput_default, {
					id: "email",
					type: "email",
					name: "email",
					value: data.email,
					className: "mt-1 block w-full",
					isFocused: true,
					onChange: (e) => setData("email", e.target.value)
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.email,
					className: "mt-2"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-4 flex items-center justify-end",
					children: /* @__PURE__ */ jsx(PrimaryButton, {
						className: "ms-4",
						disabled: processing,
						children: "Email Password Reset Link"
					})
				})
			]
		})
	] });
}
//#endregion
export { ForgotPassword as default };
