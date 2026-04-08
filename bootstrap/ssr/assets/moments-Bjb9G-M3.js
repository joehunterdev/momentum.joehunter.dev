import { t as InputError } from "./InputError-DzqGaVOs.js";
import { t as InputLabel } from "./InputLabel-zhQf8SRM.js";
import { t as PrimaryButton } from "./PrimaryButton-BiUSTvAy.js";
import { t as TextInput_default } from "./TextInput-DWxxor5z.js";
import { i as WEEK_DAYS, n as MOMENT_FORM_SECTIONS, r as SCHEDULE_FREQUENCIES, t as MOMENT_COLOR_PALETTE } from "./moments-_MXcoxL1.js";
import { n as SecondaryButton, t as Modal } from "./Modal-BhELBLaJ.js";
import { useForm } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
//#region resources/js/features/moments/hooks/useMomentForm.ts
var defaults = {
	name: "",
	description: "",
	color: "#3B82F6",
	icon: "",
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
function useMomentForm(moment, overrides) {
	return useForm({
		...defaults,
		...moment ? {
			name: moment.name,
			description: moment.description ?? "",
			color: moment.color ?? "#3B82F6",
			icon: moment.icon ?? "",
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
		} : {},
		...!moment && overrides ? overrides : {}
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
//#region resources/js/shared/constants/icons.ts
var MOMENT_ICONS = [
	{
		name: "Water",
		emoji: "💧",
		category: "health"
	},
	{
		name: "Apple",
		emoji: "🍎",
		category: "health"
	},
	{
		name: "Salad",
		emoji: "🥗",
		category: "health"
	},
	{
		name: "Vitamin",
		emoji: "💊",
		category: "health"
	},
	{
		name: "Sleep",
		emoji: "😴",
		category: "health"
	},
	{
		name: "Tooth",
		emoji: "🦷",
		category: "health"
	},
	{
		name: "Heart",
		emoji: "❤️",
		category: "health"
	},
	{
		name: "Medicine",
		emoji: "🩺",
		category: "health"
	},
	{
		name: "Run",
		emoji: "🏃",
		category: "fitness"
	},
	{
		name: "Gym",
		emoji: "🏋️",
		category: "fitness"
	},
	{
		name: "Yoga",
		emoji: "🧘",
		category: "fitness"
	},
	{
		name: "Cycle",
		emoji: "🚴",
		category: "fitness"
	},
	{
		name: "Swim",
		emoji: "🏊",
		category: "fitness"
	},
	{
		name: "Walk",
		emoji: "🚶",
		category: "fitness"
	},
	{
		name: "Stretch",
		emoji: "🤸",
		category: "fitness"
	},
	{
		name: "Hike",
		emoji: "🥾",
		category: "fitness"
	},
	{
		name: "Meditate",
		emoji: "🧘",
		category: "mind"
	},
	{
		name: "Read",
		emoji: "📚",
		category: "mind"
	},
	{
		name: "Journal",
		emoji: "📝",
		category: "mind"
	},
	{
		name: "Brain",
		emoji: "🧠",
		category: "mind"
	},
	{
		name: "Pray",
		emoji: "🙏",
		category: "mind"
	},
	{
		name: "Breathe",
		emoji: "🌬️",
		category: "mind"
	},
	{
		name: "Gratitude",
		emoji: "🌸",
		category: "mind"
	},
	{
		name: "Learn",
		emoji: "🎓",
		category: "mind"
	},
	{
		name: "Code",
		emoji: "💻",
		category: "work"
	},
	{
		name: "Email",
		emoji: "📧",
		category: "work"
	},
	{
		name: "Meeting",
		emoji: "🤝",
		category: "work"
	},
	{
		name: "Study",
		emoji: "📖",
		category: "work"
	},
	{
		name: "Write",
		emoji: "✍️",
		category: "work"
	},
	{
		name: "Plan",
		emoji: "📋",
		category: "work"
	},
	{
		name: "Focus",
		emoji: "🎯",
		category: "work"
	},
	{
		name: "Review",
		emoji: "🔍",
		category: "work"
	},
	{
		name: "Call",
		emoji: "📞",
		category: "social"
	},
	{
		name: "Family",
		emoji: "👨‍👩‍👧",
		category: "social"
	},
	{
		name: "Friends",
		emoji: "👥",
		category: "social"
	},
	{
		name: "Message",
		emoji: "💬",
		category: "social"
	},
	{
		name: "Date",
		emoji: "💑",
		category: "social"
	},
	{
		name: "Volunteer",
		emoji: "🫶",
		category: "social"
	},
	{
		name: "Music",
		emoji: "🎵",
		category: "creative"
	},
	{
		name: "Art",
		emoji: "🎨",
		category: "creative"
	},
	{
		name: "Camera",
		emoji: "📷",
		category: "creative"
	},
	{
		name: "Guitar",
		emoji: "🎸",
		category: "creative"
	},
	{
		name: "Dance",
		emoji: "💃",
		category: "creative"
	},
	{
		name: "Craft",
		emoji: "🧵",
		category: "creative"
	},
	{
		name: "Star",
		emoji: "⭐",
		category: "general"
	},
	{
		name: "Fire",
		emoji: "🔥",
		category: "general"
	},
	{
		name: "Check",
		emoji: "✅",
		category: "general"
	},
	{
		name: "Clock",
		emoji: "⏰",
		category: "general"
	},
	{
		name: "Money",
		emoji: "💰",
		category: "general"
	},
	{
		name: "Clean",
		emoji: "🧹",
		category: "general"
	},
	{
		name: "Cook",
		emoji: "🍳",
		category: "general"
	},
	{
		name: "Plant",
		emoji: "🌱",
		category: "general"
	},
	{
		name: "Sun",
		emoji: "☀️",
		category: "general"
	},
	{
		name: "Moon",
		emoji: "🌙",
		category: "general"
	}
];
var ICON_CATEGORIES = [
	"all",
	"health",
	"fitness",
	"mind",
	"work",
	"social",
	"creative",
	"general"
];
//#endregion
//#region resources/js/features/moments/components/IconPicker.tsx
function IconPicker({ value, onChange }) {
	const [open, setOpen] = useState(false);
	const [category, setCategory] = useState("all");
	const [search, setSearch] = useState("");
	const searchRef = useRef(null);
	const isKnown = MOMENT_ICONS.some((i) => i.emoji === value);
	const filtered = MOMENT_ICONS.filter((icon) => {
		const matchesCategory = category === "all" || icon.category === category;
		const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase());
		return matchesCategory && matchesSearch;
	});
	const noResults = filtered.length === 0 && search.trim().length > 0;
	function handleOpen() {
		setOpen(true);
		setTimeout(() => searchRef.current?.focus(), 0);
	}
	function handleSelect(emoji) {
		onChange(emoji);
		setOpen(false);
		setSearch("");
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "icon-picker",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => open ? setOpen(false) : handleOpen(),
			className: `icon-picker__trigger${open ? " icon-picker__trigger--open" : ""}`,
			children: [value ? /* @__PURE__ */ jsxs("span", {
				className: "icon-picker__trigger-emoji",
				children: [value, !isKnown && /* @__PURE__ */ jsx("span", {
					className: "icon-picker__custom-badge",
					children: "custom"
				})]
			}) : /* @__PURE__ */ jsx("span", {
				className: "icon-picker__trigger-placeholder",
				children: "Choose icon…"
			}), /* @__PURE__ */ jsx("svg", {
				className: "icon-picker__trigger-chevron",
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 20 20",
				fill: "currentColor",
				width: "16",
				height: "16",
				children: /* @__PURE__ */ jsx("path", {
					fillRule: "evenodd",
					d: "M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z",
					clipRule: "evenodd"
				})
			})]
		}), open && /* @__PURE__ */ jsxs("div", {
			className: "icon-picker__panel",
			children: [
				/* @__PURE__ */ jsx("input", {
					ref: searchRef,
					type: "text",
					placeholder: "Search…",
					value: search,
					onChange: (e) => setSearch(e.target.value),
					className: "icon-picker__search"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "icon-picker__categories",
					children: ICON_CATEGORIES.map((cat) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							setCategory(cat);
							setSearch("");
						},
						className: `icon-picker__cat-btn${category === cat ? " icon-picker__cat-btn--active" : ""}`,
						children: cat
					}, cat))
				}),
				noResults ? /* @__PURE__ */ jsxs("div", {
					className: "icon-picker__no-results",
					children: [/* @__PURE__ */ jsxs("p", {
						className: "icon-picker__no-results-label",
						children: [
							"No results for “",
							search,
							"”"
						]
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "icon-picker__add-new",
						onClick: () => handleSelect(search.trim()),
						children: [/* @__PURE__ */ jsx("span", {
							className: "icon-picker__add-new-preview",
							children: search.trim()
						}), "Add as custom"]
					})]
				}) : /* @__PURE__ */ jsxs("div", {
					className: "icon-picker__grid",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						title: "No icon",
						onClick: () => handleSelect(""),
						className: `icon-picker__item icon-picker__item--none${!value ? " icon-picker__item--selected" : ""}`,
						children: "—"
					}), filtered.map((icon) => /* @__PURE__ */ jsx("button", {
						type: "button",
						title: icon.name,
						onClick: () => handleSelect(icon.emoji),
						className: `icon-picker__item${value === icon.emoji ? " icon-picker__item--selected" : ""}`,
						children: icon.emoji
					}, icon.emoji + icon.name))]
				})
			]
		})]
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
function MomentForm({ moment, defaultValues, onSubmit, submitLabel = "Save", onCancel }) {
	const form = useMomentForm(moment, defaultValues);
	const [openSection, setOpenSection] = useState(!moment && defaultValues?.frequency ? "schedule" : "basics");
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
										htmlFor: "icon",
										value: "Icon"
									}),
									/* @__PURE__ */ jsx("div", {
										className: "mt-2",
										children: /* @__PURE__ */ jsx(IconPicker, {
											value: form.data.icon,
											onChange: (emoji) => setField("icon", emoji)
										})
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
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex justify-end gap-3 pt-2",
			children: [onCancel && /* @__PURE__ */ jsx(SecondaryButton, {
				type: "button",
				onClick: onCancel,
				children: "Cancel"
			}), /* @__PURE__ */ jsx(PrimaryButton, {
				disabled: form.processing,
				children: submitLabel
			})]
		})]
	});
}
//#endregion
//#region resources/js/features/moments/components/MomentModal.tsx
function MomentModal({ show, onClose, moment, defaultValues, onSubmit, submitLabel }) {
	return /* @__PURE__ */ jsx(Modal, {
		show,
		onClose,
		maxWidth: "2xl",
		children: /* @__PURE__ */ jsxs("div", {
			className: "moment-modal",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "moment-modal__header",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "moment-modal__title",
					children: moment ? "Edit Moment" : "New Moment"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "moment-modal__close",
					onClick: onClose,
					"aria-label": "Close",
					children: /* @__PURE__ */ jsx("svg", {
						xmlns: "http://www.w3.org/2000/svg",
						viewBox: "0 0 20 20",
						fill: "currentColor",
						width: "20",
						height: "20",
						children: /* @__PURE__ */ jsx("path", { d: "M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" })
					})
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "moment-modal__body",
				children: /* @__PURE__ */ jsx(MomentForm, {
					moment,
					defaultValues,
					onSubmit,
					submitLabel: submitLabel ?? (moment ? "Save Changes" : "Create Moment"),
					onCancel: onClose
				})
			})]
		})
	});
}
//#endregion
export { MomentModal as t };
