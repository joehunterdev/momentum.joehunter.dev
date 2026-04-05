import { n as InputError, t as TextInput_default } from "./TextInput-smPfIKTz.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-CzJZismR.js";
import { Link, useForm, usePage } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Transition } from "@headlessui/react";
//#region resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.tsx
function UpdateProfileInformation({ mustVerifyEmail, status, className = "" }) {
	const user = usePage().props.auth.user;
	const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
		name: user.name,
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
						htmlFor: "name",
						value: "Name"
					}),
					/* @__PURE__ */ jsx(TextInput_default, {
						id: "name",
						className: "mt-1 block w-full",
						value: data.name,
						onChange: (e) => setData("name", e.target.value),
						required: true,
						isFocused: true,
						autoComplete: "name"
					}),
					/* @__PURE__ */ jsx(InputError, {
						className: "mt-2",
						message: errors.name
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
