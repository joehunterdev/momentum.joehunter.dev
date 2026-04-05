import { n as InputError, t as TextInput_default } from "./TextInput-smPfIKTz.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-CzJZismR.js";
import { t as Guest } from "./GuestLayout-DrJWOWPt.js";
import { Head, useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Auth/ConfirmPassword.tsx
function ConfirmPassword() {
	const { data, setData, post, processing, errors, reset } = useForm({ password: "" });
	const submit = (e) => {
		e.preventDefault();
		post(route("password.confirm"), { onFinish: () => reset("password") });
	};
	return /* @__PURE__ */ jsxs(Guest, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Confirm Password" }),
		/* @__PURE__ */ jsx("div", {
			className: "mb-4 text-sm text-gray-600",
			children: "This is a secure area of the application. Please confirm your password before continuing."
		}),
		/* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			children: [/* @__PURE__ */ jsxs("div", {
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
						isFocused: true,
						onChange: (e) => setData("password", e.target.value)
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.password,
						className: "mt-2"
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-4 flex items-center justify-end",
				children: /* @__PURE__ */ jsx(PrimaryButton, {
					className: "ms-4",
					disabled: processing,
					children: "Confirm"
				})
			})]
		})
	] });
}
//#endregion
export { ConfirmPassword as default };
