import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-BiUSTvAy.js";
import { t as Authenticated } from "./AuthenticatedLayout-Boxls7xi.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { i as WEEK_DAYS } from "./moments-_MXcoxL1.js";
import { Head, useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/features/config/components/SleepHelper.tsx
/** Parses "HH:mm" to total minutes since midnight. */
function toMinutes(time) {
	const [h, m] = time.split(":").map(Number);
	return h * 60 + m;
}
/** Formats total minutes (may be negative or >1440) back to "HH:mm". */
function fromMinutes(minutes) {
	const normalized = (minutes % 1440 + 1440) % 1440;
	const h = Math.floor(normalized / 60);
	const m = normalized % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
var TARGET_SLEEP_MINUTES = 480;
function SleepHelper({ wakeTime, sleepTime, field, onApply }) {
	if (!wakeTime || !sleepTime) return null;
	const wakeMinutes = toMinutes(wakeTime);
	const sleepMinutes = toMinutes(sleepTime);
	const gap = sleepMinutes <= wakeMinutes ? wakeMinutes - sleepMinutes : 1440 - sleepMinutes + wakeMinutes;
	if (gap === TARGET_SLEEP_MINUTES) return null;
	const diffMins = Math.abs(TARGET_SLEEP_MINUTES - gap);
	const hrs = Math.floor(diffMins / 60);
	const mins = diffMins % 60;
	const diffLabel = hrs > 0 ? `${hrs}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
	const verb = gap < TARGET_SLEEP_MINUTES ? "short of" : "over";
	let suggestion;
	if (field === "sleep_time") suggestion = fromMinutes(wakeMinutes - TARGET_SLEEP_MINUTES);
	else suggestion = fromMinutes(sleepMinutes + TARGET_SLEEP_MINUTES);
	return /* @__PURE__ */ jsxs("p", {
		className: "sleep-helper",
		children: [
			diffLabel,
			" ",
			verb,
			" 8 hrs.",
			" ",
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				className: "sleep-helper__cta",
				onClick: () => onApply(field, suggestion),
				children: [
					"Set ",
					field === "sleep_time" ? "sleep time" : "wake time",
					" to ",
					suggestion
				]
			})
		]
	});
}
//#endregion
//#region resources/js/features/config/components/ConfigForm.tsx
var timeInputClass = "mm-input mt-1 block w-full px-3 py-2 text-sm focus:outline-none";
function ConfigForm({ config }) {
	const form = useForm({
		wake_time: config.wake_time.slice(0, 5),
		sleep_time: config.sleep_time.slice(0, 5),
		week_starts_on: config.week_starts_on,
		office_start: config.office_start.slice(0, 5),
		office_end: config.office_end.slice(0, 5),
		identity_statement: config.identity_statement ?? ""
	});
	function handleSubmit(e) {
		e.preventDefault();
		form.put(route("config.update"));
	}
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("section", { children: [
				/* @__PURE__ */ jsx("h2", {
					className: "config-section-title",
					children: "Sleep Schedule"
				}),
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
							className: timeInputClass
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
							className: timeInputClass
						}),
						/* @__PURE__ */ jsx(InputError, {
							message: form.errors.sleep_time,
							className: "mt-1"
						})
					] })]
				}),
				/* @__PURE__ */ jsx(SleepHelper, {
					wakeTime: form.data.wake_time,
					sleepTime: form.data.sleep_time,
					field: "sleep_time",
					onApply: (field, value) => form.setData(field, value)
				})
			] }),
			/* @__PURE__ */ jsxs("section", { children: [
				/* @__PURE__ */ jsx("h2", {
					className: "config-section-title",
					children: "Office Hours"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "config-section-hint",
					children: "Used to shade your working window in the weekly view."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(InputLabel, {
							htmlFor: "office_start",
							value: "Start"
						}),
						/* @__PURE__ */ jsx("input", {
							id: "office_start",
							type: "time",
							value: form.data.office_start,
							onChange: (e) => form.setData("office_start", e.target.value),
							className: timeInputClass
						}),
						/* @__PURE__ */ jsx(InputError, {
							message: form.errors.office_start,
							className: "mt-1"
						})
					] }), /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(InputLabel, {
							htmlFor: "office_end",
							value: "End"
						}),
						/* @__PURE__ */ jsx("input", {
							id: "office_end",
							type: "time",
							value: form.data.office_end,
							onChange: (e) => form.setData("office_end", e.target.value),
							className: timeInputClass
						}),
						/* @__PURE__ */ jsx(InputError, {
							message: form.errors.office_end,
							className: "mt-1"
						})
					] })]
				})
			] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h2", {
				className: "config-section-title",
				children: "Week Preferences"
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ jsx(InputLabel, {
						htmlFor: "week_starts_on",
						value: "Week starts on"
					}),
					/* @__PURE__ */ jsx("select", {
						id: "week_starts_on",
						value: form.data.week_starts_on,
						onChange: (e) => form.setData("week_starts_on", Number(e.target.value)),
						className: timeInputClass,
						children: WEEK_DAYS.map((opt) => /* @__PURE__ */ jsx("option", {
							value: opt.value,
							children: opt.full
						}, opt.value))
					}),
					/* @__PURE__ */ jsx(InputError, {
						message: form.errors.week_starts_on,
						className: "mt-1"
					})
				]
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [
				/* @__PURE__ */ jsx("h2", {
					className: "config-section-title",
					children: "Identity Statement"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "config-section-hint",
					children: "A short sentence that captures who you're becoming — shown as a daily reminder. For example: “I am someone who shows up consistently.”"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative mt-4",
					children: [/* @__PURE__ */ jsx("textarea", {
						id: "identity_statement",
						rows: 3,
						maxLength: 500,
						value: form.data.identity_statement,
						onChange: (e) => form.setData("identity_statement", e.target.value),
						placeholder: "I am someone who…",
						className: "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					}), /* @__PURE__ */ jsxs("span", {
						className: "config-char-count",
						children: [form.data.identity_statement.length, " / 500"]
					})]
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: form.errors.identity_statement,
					className: "mt-1"
				})
			] }),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ jsx(PrimaryButton, {
					disabled: form.processing,
					children: "Save Config"
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
			children: "Config"
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Config" }),
			/* @__PURE__ */ jsx(FlashMessage, {}),
			/* @__PURE__ */ jsx("div", {
				className: "py-8",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-xl px-4 sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx("div", {
						className: "mm-form-card bg-white p-6 shadow-sm",
						children: /* @__PURE__ */ jsx(ConfigForm, { config })
					})
				})
			})
		]
	});
}
//#endregion
export { Edit as default };
