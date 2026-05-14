import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-BiUSTvAy.js";
import { t as TextInput_default } from "./TextInput-DWxxor5z.js";
import { t as Guest } from "./GuestLayout-DT9g61qr.js";
import { Head, Link, useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Auth/Register.tsx
function Register() {
	const { data, setData, post, processing, errors, reset } = useForm({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		password_confirmation: ""
	});
	const submit = (e) => {
		e.preventDefault();
		post(route("register"), { onFinish: () => reset("password", "password_confirmation") });
	};
	return /* @__PURE__ */ jsxs(Guest, { children: [/* @__PURE__ */ jsx(Head, { title: "Register" }), /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		children: [
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, {
					htmlFor: "first_name",
					value: "First Name"
				}),
				/* @__PURE__ */ jsx(TextInput_default, {
					id: "first_name",
					name: "first_name",
					value: data.first_name,
					className: "mt-1 block w-full",
					autoComplete: "given-name",
					isFocused: true,
					onChange: (e) => setData("first_name", e.target.value),
					required: true
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.first_name,
					className: "mt-2"
				})
			] }),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "last_name",
						value: "Last Name"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "last_name",
						name: "last_name",
						value: data.last_name,
						className: "mt-1 block w-full",
						autoComplete: "family-name",
						onChange: (e) => setData("last_name", e.target.value),
						required: true
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.last_name,
						className: "mt-2"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4",
				children: [
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
						onChange: (e) => setData("email", e.target.value),
						required: true
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.email,
						className: "mt-2"
					})
				]
			}),
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
						autoComplete: "new-password",
						onChange: (e) => setData("password", e.target.value),
						required: true
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.password,
						className: "mt-2"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "password_confirmation",
						value: "Confirm Password"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "password_confirmation",
						type: "password",
						name: "password_confirmation",
						value: data.password_confirmation,
						className: "mt-1 block w-full",
						autoComplete: "new-password",
						onChange: (e) => setData("password_confirmation", e.target.value),
						required: true
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: errors.password_confirmation,
						className: "mt-2"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex items-center justify-end",
				children: [/* @__PURE__ */ jsx(Link, {
					href: route("login"),
					className: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
					children: "Already registered?"
				}), /* @__PURE__ */ jsx(PrimaryButton, {
					className: "ms-4",
					disabled: processing,
					children: "Register"
				})]
			})
		]
	})] });
}
//#endregion
export { Register as default };
