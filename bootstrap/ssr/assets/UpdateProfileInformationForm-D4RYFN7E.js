import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-BiUSTvAy.js";
import { t as TextInput_default } from "./TextInput-DWxxor5z.js";
import { Link, useForm, usePage } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Transition } from "@headlessui/react";
//#region resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.tsx
function UpdateProfileInformation({ mustVerifyEmail, status, className = "" }) {
	const user = usePage().props.auth.user;
	const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
		first_name: user.first_name,
		last_name: user.last_name,
		email: user.email
	});
	const submit = (e) => {
		e.preventDefault();
		patch(route("profile.update"));
	};
	return /* @__PURE__ */ jsxs("section", {
		className,
		children: [/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h2", {
			className: "text-lg font-medium text-gray-900",
			children: "Profile Information"
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-sm text-gray-600",
			children: "Update your account's profile information and email address."
		})] }), /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "mt-6 space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "first_name",
						value: "First name"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "first_name",
						className: "mt-1 block w-full",
						value: data.first_name,
						onChange: (e) => setData("first_name", e.target.value),
						required: true,
						isFocused: true,
						autoComplete: "given-name"
					}),
					/* @__PURE__ */ jsx(InputError, {
						className: "mt-2",
						message: errors.first_name
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "last_name",
						value: "Last name"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "last_name",
						className: "mt-1 block w-full",
						value: data.last_name,
						onChange: (e) => setData("last_name", e.target.value),
						required: true,
						autoComplete: "family-name"
					}),
					/* @__PURE__ */ jsx(InputError, {
						className: "mt-2",
						message: errors.last_name
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "email",
						value: "Email"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "email",
						type: "email",
						className: "mt-1 block w-full",
						value: data.email,
						onChange: (e) => setData("email", e.target.value),
						required: true,
						autoComplete: "username"
					}),
					/* @__PURE__ */ jsx(InputError, {
						className: "mt-2",
						message: errors.email
					})
				] }),
				mustVerifyEmail && user.email_verified_at === null && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("p", {
					className: "mt-2 text-sm text-gray-800",
					children: ["Your email address is unverified.", /* @__PURE__ */ jsx(Link, {
						href: route("verification.send"),
						method: "post",
						as: "button",
						className: "rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
						children: "Click here to re-send the verification email."
					})]
				}), status === "verification-link-sent" && /* @__PURE__ */ jsx("div", {
					className: "mt-2 text-sm font-medium text-green-600",
					children: "A new verification link has been sent to your email address."
				})] }),
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
export { UpdateProfileInformation as default };
