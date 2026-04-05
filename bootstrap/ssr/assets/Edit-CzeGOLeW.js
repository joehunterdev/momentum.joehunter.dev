import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-CzJZismR.js";
import { t as Authenticated } from "./AuthenticatedLayout-Se8rC2mR.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { i as WEEK_DAYS } from "./moments-Yv4IT7zH.js";
import { Head, useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/features/config/components/ConfigForm.tsx
function ConfigForm({ config }) {
	const form = useForm({
		wake_time: config.wake_time.slice(0, 5),
		sleep_time: config.sleep_time.slice(0, 5),
		week_starts_on: config.week_starts_on
	});
	function handleSubmit(e) {
		e.preventDefault();
		form.put(route("config.update"));
	}
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-6 sm:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "wake_time",
						value: "Wake time"
					}),
					/* @__PURE__ */ jsx("input", {
						id: "wake_time",
						type: "time",
						value: form.data.wake_time,
						onChange: (e) => form.setData("wake_time", e.target.value),
						className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: form.errors.wake_time,
						className: "mt-1"
					})
				] }), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "sleep_time",
						value: "Sleep time"
					}),
					/* @__PURE__ */ jsx("input", {
						id: "sleep_time",
						type: "time",
						value: form.data.sleep_time,
						onChange: (e) => form.setData("sleep_time", e.target.value),
						className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: form.errors.sleep_time,
						className: "mt-1"
					})
				] })]
			}),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, {
					htmlFor: "week_starts_on",
					value: "Week starts on"
				}),
				/* @__PURE__ */ jsx("select", {
					id: "week_starts_on",
					value: form.data.week_starts_on,
					onChange: (e) => form.setData("week_starts_on", Number(e.target.value)),
					className: "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
					children: WEEK_DAYS.map((opt) => /* @__PURE__ */ jsx("option", {
						value: opt.value,
						children: opt.label
					}, opt.value))
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: form.errors.week_starts_on,
					className: "mt-1"
				})
			] }),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ jsx(PrimaryButton, {
					disabled: form.processing,
					children: "Save Settings"
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Config/Edit.tsx
function Edit({ config }) {
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx("h2", {
			className: "text-xl font-semibold text-gray-800",
			children: "Settings"
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Settings" }),
			/* @__PURE__ */ jsx(FlashMessage, {}),
			/* @__PURE__ */ jsx("div", {
				className: "py-8",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-xl px-4 sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx("div", {
						className: "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
						children: /* @__PURE__ */ jsx(ConfigForm, { config })
					})
				})
			})
		]
	});
}
//#endregion
export { Edit as default };
