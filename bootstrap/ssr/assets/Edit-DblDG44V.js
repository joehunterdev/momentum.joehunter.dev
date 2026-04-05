import { t as Authenticated } from "./AuthenticatedLayout-DJIZRrtV.js";
import DeleteUserForm from "./DeleteUserForm-jQUj8GKp.js";
import UpdatePasswordForm from "./UpdatePasswordForm-EkZOcK2b.js";
import UpdateProfileInformation from "./UpdateProfileInformationForm-C0H6RyMS.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Profile/Edit.tsx
function Edit({ mustVerifyEmail, status }) {
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx("h2", {
			className: "text-xl font-semibold leading-tight text-gray-800",
			children: "Profile"
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Profile" }), /* @__PURE__ */ jsx("div", {
			className: "py-12",
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "bg-white p-4 shadow sm:rounded-lg sm:p-8",
						children: /* @__PURE__ */ jsx(UpdateProfileInformation, {
							mustVerifyEmail,
							status,
							className: "max-w-xl"
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "bg-white p-4 shadow sm:rounded-lg sm:p-8",
						children: /* @__PURE__ */ jsx(UpdatePasswordForm, { className: "max-w-xl" })
					}),
					/* @__PURE__ */ jsx("div", {
						className: "bg-white p-4 shadow sm:rounded-lg sm:p-8",
						children: /* @__PURE__ */ jsx(DeleteUserForm, { className: "max-w-xl" })
					})
				]
			})
		})]
	});
}
//#endregion
export { Edit as default };
