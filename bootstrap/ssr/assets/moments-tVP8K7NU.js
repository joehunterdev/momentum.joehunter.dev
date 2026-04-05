import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-CzJZismR.js";
import { t as TextInput_default } from "./TextInput-DrClm5Kx.js";
import { i as WEEK_DAYS, n as MOMENT_FORM_SECTIONS, r as SCHEDULE_FREQUENCIES, t as MOMENT_COLOR_PALETTE } from "./moments-Yv4IT7zH.js";
import { useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
//#region resources/js/features/moments/hooks/useMomentForm.ts
var defaults = {
	name: "",
	description: "",
	color: "#3B82F6",
	icon: "",
	identity_statement: "",
	sort_order: 0,
	is_active: true,
	frequency: "daily",
	days_of_week: [],
	preferred_time: "",
	implementation_intention: "",
	habit_stack_after: "",
	environment_prompt: "",
	reward_description: "",
	temptation_bundle: ""
};
function useMomentForm(moment) {
	return useForm({
		...defaults,
		...moment ? {
			name: moment.name,
			description: moment.description ?? "",
			color: moment.color ?? "#3B82F6",
			icon: moment.icon ?? "",
			identity_statement: moment.identity_statement ?? "",
			sort_order: moment.sort_order,
			is_active: moment.is_active,
			frequency: moment.schedule?.frequency ?? "daily",
			days_of_week: moment.schedule?.days_of_week ?? [],
			preferred_time: moment.schedule?.preferred_time ?? "",
			implementation_intention: moment.cue?.implementation_intention ?? "",
			habit_stack_after: moment.cue?.habit_stack_after ?? "",
			environment_prompt: moment.cue?.environment_prompt ?? "",
			reward_description: moment.reward?.description ?? "",
			temptation_bundle: moment.reward?.temptation_bundle ?? ""
		} : {}
	});
}
//#endregion
//#region resources/js/features/moments/components/ColorPicker.tsx
function ColorPicker({ value, onChange }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-wrap gap-2",
		children: MOMENT_COLOR_PALETTE.map((color) => /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => onChange(color),
			"aria-label": `Select colour ${color}`,
			className: `h-8 w-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${value === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"}`,
			style: {
				backgroundColor: color,
				focusRingColor: color
			}
		}, color))
	});
}
//#endregion
//#region resources/js/features/moments/components/CueFields.tsx
function CueFields({ implementationIntention, habitStackAfter, environmentPrompt, errors, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, {
					htmlFor: "implementation_intention",
					value: "Implementation intention"
				}),
				/* @__PURE__ */ jsx(TextInput_default, {
					id: "implementation_intention",
					value: implementationIntention,
					onChange: (e) => onChange("implementation_intention", e.target.value),
					placeholder: "I will [behaviour] at [time] in [location]",
					className: "mt-1 block w-full"
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.implementation_intention,
					className: "mt-1"
				})
			] }),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, {
					htmlFor: "habit_stack_after",
					value: "Habit stacking"
				}),
				/* @__PURE__ */ jsx(TextInput_default, {
					id: "habit_stack_after",
					value: habitStackAfter,
					onChange: (e) => onChange("habit_stack_after", e.target.value),
					placeholder: "After I [existing habit]…",
					className: "mt-1 block w-full"
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.habit_stack_after,
					className: "mt-1"
				})
			] }),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, {
					htmlFor: "environment_prompt",
					value: "Environment prompt"
				}),
				/* @__PURE__ */ jsx(TextInput_default, {
					id: "environment_prompt",
					value: environmentPrompt,
					onChange: (e) => onChange("environment_prompt", e.target.value),
					placeholder: "e.g. Book on the bedside table",
					className: "mt-1 block w-full"
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.environment_prompt,
					className: "mt-1"
				})
			] })
		]
	});
}
//#endregion
//#region resources/js/features/moments/components/RewardFields.tsx
function RewardFields({ rewardDescription, temptationBundle, errors, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsx(InputLabel, {
				htmlFor: "reward_description",
				value: "Reward"
			}),
			/* @__PURE__ */ jsx(TextInput_default, {
				id: "reward_description",
				value: rewardDescription,
				onChange: (e) => onChange("reward_description", e.target.value),
				placeholder: "What's my reward after completing this?",
				className: "mt-1 block w-full"
			}),
			/* @__PURE__ */ jsx(InputError, {
				message: errors.reward_description,
				className: "mt-1"
			})
		] }), /* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsx(InputLabel, {
				htmlFor: "temptation_bundle",
				value: "Temptation bundling"
			}),
			/* @__PURE__ */ jsx(TextInput_default, {
				id: "temptation_bundle",
				value: temptationBundle,
				onChange: (e) => onChange("temptation_bundle", e.target.value),
				placeholder: "Pair with something enjoyable, e.g. podcast while walking",
				className: "mt-1 block w-full"
			}),
			/* @__PURE__ */ jsx(InputError, {
				message: errors.temptation_bundle,
				className: "mt-1"
			})
		] })]
	});
}
//#endregion
//#region resources/js/features/moments/components/ScheduleFields.tsx
function ScheduleFields({ frequency, daysOfWeek, preferredTime, errors, onChange }) {
	function toggleDay(day) {
		onChange("days_of_week", (daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day]).sort((a, b) => a - b));
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, { value: "Frequency" }),
				/* @__PURE__ */ jsx("div", {
					className: "mt-1 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1",
					children: SCHEDULE_FREQUENCIES.map((freq) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onChange("frequency", freq.value),
						className: `rounded-md px-4 py-1.5 text-sm font-medium transition-all ${frequency === freq.value ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`,
						children: freq.label
					}, freq.value))
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.frequency,
					className: "mt-1"
				})
			] }),
			frequency !== "daily" && /* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, { value: "Days of the week" }),
				/* @__PURE__ */ jsx("div", {
					className: "mt-1 flex gap-2",
					children: WEEK_DAYS.map((day) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => toggleDay(day.value),
						"aria-label": `Toggle ${day.full}`,
						"aria-pressed": daysOfWeek.includes(day.value),
						className: `flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${daysOfWeek.includes(day.value) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`,
						children: day.label
					}, day.value))
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.days_of_week,
					className: "mt-1"
				})
			] }),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx(InputLabel, {
					htmlFor: "preferred_time",
					value: "Preferred time (optional)"
				}),
				/* @__PURE__ */ jsx("input", {
					id: "preferred_time",
					type: "time",
					value: preferredTime,
					onChange: (e) => onChange("preferred_time", e.target.value),
					className: "mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
				}),
				/* @__PURE__ */ jsx(InputError, {
					message: errors.preferred_time,
					className: "mt-1"
				})
			] })
		]
	});
}
//#endregion
//#region resources/js/features/moments/components/MomentForm.tsx
function MomentForm({ moment, onSubmit, submitLabel = "Save" }) {
	const form = useMomentForm(moment);
	const [openSection, setOpenSection] = useState("basics");
	function handleSubmit(e) {
		e.preventDefault();
		onSubmit(form.data, form);
	}
	function setField(field, value) {
		form.setData(field, value);
	}
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "space-y-3",
		children: [MOMENT_FORM_SECTIONS.map((section) => {
			const isOpen = openSection === section.id;
			return /* @__PURE__ */ jsxs("div", {
				className: "overflow-hidden rounded-xl border border-gray-200 bg-white",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setOpenSection(isOpen ? "" : section.id),
					className: "flex w-full items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", { children: section.emoji }), /* @__PURE__ */ jsx("span", { children: section.label })]
					}), /* @__PURE__ */ jsx("span", {
						className: "text-gray-400",
						children: isOpen ? "▲" : "▼"
					})]
				}), isOpen && /* @__PURE__ */ jsxs("div", {
					className: "border-t border-gray-100 px-5 py-4",
					children: [
						section.id === "basics" && /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx(InputLabel, {
										htmlFor: "name",
										value: "Name *"
									}),
									/* @__PURE__ */ jsx(TextInput_default, {
										id: "name",
										value: form.data.name,
										onChange: (e) => setField("name", e.target.value),
										required: true,
										autoFocus: true,
										placeholder: "e.g. Drink 8 glasses of water",
										className: "mt-1 block w-full"
									}),
									/* @__PURE__ */ jsx(InputError, {
										message: form.errors.name,
										className: "mt-1"
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx(InputLabel, {
										htmlFor: "description",
										value: "Description"
									}),
									/* @__PURE__ */ jsx(TextInput_default, {
										id: "description",
										value: form.data.description,
										onChange: (e) => setField("description", e.target.value),
										placeholder: "Optional notes",
										className: "mt-1 block w-full"
									}),
									/* @__PURE__ */ jsx(InputError, {
										message: form.errors.description,
										className: "mt-1"
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx(InputLabel, {
										htmlFor: "identity_statement",
										value: "Identity statement"
									}),
									/* @__PURE__ */ jsx(TextInput_default, {
										id: "identity_statement",
										value: form.data.identity_statement,
										onChange: (e) => setField("identity_statement", e.target.value),
										placeholder: "e.g. I am someone who stays hydrated",
										className: "mt-1 block w-full"
									}),
									/* @__PURE__ */ jsx(InputError, {
										message: form.errors.identity_statement,
										className: "mt-1"
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx(InputLabel, {
										htmlFor: "icon",
										value: "Icon (emoji)"
									}),
									/* @__PURE__ */ jsx(TextInput_default, {
										id: "icon",
										value: form.data.icon,
										onChange: (e) => setField("icon", e.target.value),
										placeholder: "💧",
										className: "mt-1 block w-24"
									}),
									/* @__PURE__ */ jsx(InputError, {
										message: form.errors.icon,
										className: "mt-1"
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx(InputLabel, { value: "Colour" }),
									/* @__PURE__ */ jsx("div", {
										className: "mt-2",
										children: /* @__PURE__ */ jsx(ColorPicker, {
											value: form.data.color,
											onChange: (c) => setField("color", c)
										})
									}),
									/* @__PURE__ */ jsx(InputError, {
										message: form.errors.color,
										className: "mt-1"
									})
								] })
							]
						}),
						section.id === "schedule" && /* @__PURE__ */ jsx(ScheduleFields, {
							frequency: form.data.frequency,
							daysOfWeek: form.data.days_of_week,
							preferredTime: form.data.preferred_time,
							errors: form.errors,
							onChange: (field, value) => setField(field, value)
						}),
						section.id === "cue" && /* @__PURE__ */ jsx(CueFields, {
							implementationIntention: form.data.implementation_intention,
							habitStackAfter: form.data.habit_stack_after,
							environmentPrompt: form.data.environment_prompt,
							errors: form.errors,
							onChange: (field, value) => setField(field, value)
						}),
						section.id === "reward" && /* @__PURE__ */ jsx(RewardFields, {
							rewardDescription: form.data.reward_description,
							temptationBundle: form.data.temptation_bundle,
							errors: form.errors,
							onChange: (field, value) => setField(field, value)
						})
					]
				})]
			}, section.id);
		}), /* @__PURE__ */ jsx("div", {
			className: "flex justify-end pt-2",
			children: /* @__PURE__ */ jsx(PrimaryButton, {
				disabled: form.processing,
				children: submitLabel
			})
		})]
	});
}
//#endregion
export { MomentForm as t };
