import { t as Authenticated } from "./AuthenticatedLayout-Boxls7xi.js";
import { i as WEEK_DAYS } from "./moments-_MXcoxL1.js";
import { n as SlotMomentIcon, t as DateSelectorBar } from "./calendar-DIGqph9n.js";
import { n as MOMENT_ICONS, t as MomentModal } from "./moments-TfAPYsdV.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { createPortal } from "react-dom";
//#region resources/js/features/weekly/components/AddSlotPopover.tsx
function AddSlotPopover({ isOpen, anchorRef, onClose, onSelectOnce, onSelectRecurring }) {
	const ref = useRef(null);
	const [coords, setCoords] = useState(null);
	useLayoutEffect(() => {
		if (!isOpen || !anchorRef.current) return;
		const rect = anchorRef.current.getBoundingClientRect();
		setCoords({
			top: rect.bottom + window.scrollY + 4,
			left: rect.left + window.scrollX + rect.width / 2
		});
	}, [isOpen, anchorRef]);
	useEffect(() => {
		if (!isOpen) return;
		function handleOutside(e) {
			if (ref.current && !ref.current.contains(e.target) && anchorRef.current && !anchorRef.current.contains(e.target)) onClose();
		}
		function handleEsc(e) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("mousedown", handleOutside);
		document.addEventListener("touchstart", handleOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleOutside);
			document.removeEventListener("touchstart", handleOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [
		isOpen,
		onClose,
		anchorRef
	]);
	if (!isOpen || !coords) return null;
	return createPortal(/* @__PURE__ */ jsxs("div", {
		ref,
		className: "slot-popover",
		role: "menu",
		style: {
			top: coords.top,
			left: coords.left
		},
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "slot-popover__option",
			role: "menuitem",
			onClick: () => {
				onSelectOnce();
				onClose();
			},
			children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				children: "📌"
			}), "Just once"]
		}), /* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "slot-popover__option",
			role: "menuitem",
			onClick: () => {
				onSelectRecurring();
				onClose();
			},
			children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				children: "🔁"
			}), "Weekdays"]
		})]
	}), document.body);
}
//#endregion
//#region resources/js/features/weekly/components/SlotMomentCard.tsx
function SlotMomentCard({ moment, variant = "configure", onGhostNameChange, onGhostIconChange }) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const iconBtnRef = useRef(null);
	const cardCls = ["slot-moment-card", variant === "ghost" ? "slot-moment-card--ghost" : ""].filter(Boolean).join(" ");
	if (variant === "ghost") return /* @__PURE__ */ jsx("div", {
		className: "slot-moment-card slot-moment-card--ghost-edit",
		children: /* @__PURE__ */ jsxs("div", {
			className: "slot-moment-card__row",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ghost-icon-wrap",
				children: [/* @__PURE__ */ jsx("button", {
					ref: iconBtnRef,
					type: "button",
					className: "slot-icon slot-icon--future slot-icon--ghost-placeholder ghost-icon-trigger",
					title: "Pick an icon",
					onClick: (e) => {
						e.stopPropagation();
						setPickerOpen((v) => !v);
					},
					children: moment.icon ?? "+"
				}), pickerOpen && /* @__PURE__ */ jsx("div", {
					className: "ghost-icon-picker",
					role: "dialog",
					"aria-label": "Pick an icon",
					children: /* @__PURE__ */ jsx("div", {
						className: "ghost-icon-picker__grid",
						children: MOMENT_ICONS.map((opt) => /* @__PURE__ */ jsx("button", {
							type: "button",
							className: ["ghost-icon-picker__item", moment.icon === opt.emoji ? "ghost-icon-picker__item--active" : ""].filter(Boolean).join(" "),
							title: opt.name,
							onClick: () => {
								onGhostIconChange?.(opt.emoji);
								setPickerOpen(false);
							},
							children: opt.emoji
						}, opt.name))
					})
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "slot-moment-card__body",
				children: /* @__PURE__ */ jsx("input", {
					type: "text",
					className: "ghost-name-input",
					placeholder: "Name this moment…",
					value: moment.name === "New Moment" ? "" : moment.name ?? "",
					maxLength: 60,
					onChange: (e) => onGhostNameChange?.(e.target.value)
				})
			})]
		})
	});
	const name = moment.name ?? "Untitled Moment";
	return /* @__PURE__ */ jsx("div", {
		className: cardCls,
		children: /* @__PURE__ */ jsxs("div", {
			className: "slot-moment-card__row",
			children: [
				/* @__PURE__ */ jsx(SlotMomentIcon, {
					moment,
					date: "",
					onToggle: () => {},
					isStatic: true
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "slot-moment-card__body",
					children: [/* @__PURE__ */ jsx("span", {
						className: "slot-moment-card__name",
						children: name
					}), moment.description && /* @__PURE__ */ jsx("span", {
						className: "slot-moment-card__desc",
						children: moment.description
					})]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "slot-moment-card__edit-btn",
					title: `Edit ${name}`,
					onClick: () => router.get(route("moments.edit", { moment: moment.id })),
					"aria-label": `Edit ${name}`,
					children: "✏️"
				})
			]
		})
	});
}
//#endregion
//#region resources/js/features/weekly/components/TimeSlotCell.tsx
function isOutOfOffice(time, config) {
	return time < config.office_start || time >= config.office_end;
}
function TimeSlotCell({ slot, date, config, mode, isGhost, isConflict, onStartScheduling, onGhostNameChange, onGhostIconChange, ghostName, ghostIcon, isWeekend, isToday }) {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const addBtnRef = useRef(null);
	const ooo = isOutOfOffice(slot.time, config);
	const cls = [
		"weekly-slot",
		ooo && !slot.moment ? "weekly-slot--ooo" : "",
		isWeekend ? "weekly-slot--weekend" : "",
		isToday ? "weekly-slot--today" : "",
		!slot.moment && !ooo && mode === "configure" ? "weekly-slot--empty" : "",
		isConflict ? "weekly-slot--conflict" : ""
	].filter(Boolean).join(" ");
	if (mode === "overview") return /* @__PURE__ */ jsxs("div", {
		className: cls,
		children: [/* @__PURE__ */ jsx("span", {
			className: "weekly-slot__time",
			children: slot.time
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			children: slot.moment && /* @__PURE__ */ jsx(SlotMomentCard, {
				moment: slot.moment,
				variant: "overview"
			})
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: cls,
		children: [/* @__PURE__ */ jsx("span", {
			className: "weekly-slot__time",
			children: slot.time
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			style: { position: "relative" },
			children: isGhost ? /* @__PURE__ */ jsx(SlotMomentCard, {
				moment: {
					id: 0,
					name: ghostName || "New Moment",
					description: null,
					status: null,
					color: null,
					icon: ghostIcon,
					frequency: null,
					consistency: null,
					instance_id: null,
					implementation_intention: null,
					habit_stack_after: null,
					environment_prompt: null
				},
				variant: "ghost",
				onGhostNameChange,
				onGhostIconChange
			}) : slot.moment ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(SlotMomentCard, {
				moment: slot.moment,
				variant: "configure"
			}), isConflict && /* @__PURE__ */ jsx("span", {
				className: "weekly-slot__conflict-badge",
				title: "Scheduling conflict",
				children: "⚠️"
			})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
				ref: addBtnRef,
				type: "button",
				className: "weekly-slot__add-btn",
				title: `Add moment at ${slot.time}`,
				onClick: () => onStartScheduling(date, slot.time),
				children: "+"
			}), /* @__PURE__ */ jsx(AddSlotPopover, {
				isOpen: popoverOpen,
				anchorRef: addBtnRef,
				onClose: () => setPopoverOpen(false),
				onSelectOnce: () => {
					setPopoverOpen(false);
					onStartScheduling(date, slot.time);
				},
				onSelectRecurring: () => {
					setPopoverOpen(false);
					onStartScheduling(date, slot.time);
				}
			})] })
		})]
	});
}
//#endregion
//#region resources/js/features/weekly/components/DaySection.tsx
var VISIBLE_SLOTS$1 = 6;
function getWindowedSlots(slots, windowStart) {
	return slots.filter((s) => s.time.endsWith(":00")).slice(windowStart, windowStart + VISIBLE_SLOTS$1);
}
/** JS getDay() 0=Sun → ISO 1=Mon … 7=Sun */
function jsToIsoDay$1(d) {
	return d === 0 ? 7 : d;
}
function DaySection({ day, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange, windowStart }) {
	const dateObj = parseISO(day.date);
	const visibleSlots = getWindowedSlots(day.slots, windowStart);
	const dayIso = jsToIsoDay$1(dateObj.getDay());
	return /* @__PURE__ */ jsxs("section", {
		className: [
			"weekly-day-section",
			day.isToday ? "weekly-day-section--today" : "",
			day.isWeekend ? "weekly-day-section--weekend" : ""
		].filter(Boolean).join(" "),
		children: [/* @__PURE__ */ jsxs("header", {
			className: "weekly-day-header",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__name",
					children: day.dayName
				}),
				/* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__date",
					children: format(dateObj, "d MMM")
				}),
				day.isToday && /* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__badge",
					children: "Today"
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-day-slots",
			children: visibleSlots.map((slot) => {
				const schedulingThisDay = scheduling !== null && slot.time === scheduling.time && scheduling.daysOfWeek.includes(dayIso);
				const isGhost = schedulingThisDay && !slot.moment;
				const isConflict = schedulingThisDay && slot.moment !== null;
				return /* @__PURE__ */ jsx(TimeSlotCell, {
					slot,
					date: day.date,
					config,
					mode,
					isGhost,
					isConflict,
					onStartScheduling,
					onGhostNameChange,
					onGhostIconChange,
					ghostName: scheduling?.name ?? "",
					ghostIcon: scheduling?.icon ?? null,
					isWeekend: day.isWeekend,
					isToday: day.isToday
				}, `${day.date}-${slot.time}`);
			})
		})]
	});
}
//#endregion
//#region resources/js/features/weekly/components/WeeklyGrid.tsx
var VISIBLE_SLOTS = 6;
/** Returns the start index into the hourly slot array so all days show the same time window. */
function computeWindowStart(days) {
	const allTimes = Array.from(new Set(days.flatMap((d) => d.slots.map((s) => s.time).filter((t) => t.endsWith(":00"))))).sort();
	if (allTimes.length <= VISIBLE_SLOTS) return 0;
	const nowHour = (/* @__PURE__ */ new Date()).getHours();
	const nowTime = `${String(nowHour).padStart(2, "0")}:00`;
	let anchorIdx = allTimes.findIndex((t) => t >= nowTime);
	if (anchorIdx < 0) anchorIdx = allTimes.length - 1;
	const half = Math.floor(VISIBLE_SLOTS / 2);
	return Math.max(0, Math.min(anchorIdx - half, allTimes.length - VISIBLE_SLOTS));
}
function WeeklyGrid({ days, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	const windowStart = computeWindowStart(days);
	return /* @__PURE__ */ jsx("div", {
		className: "weekly-grid",
		children: days.map((day) => /* @__PURE__ */ jsx(DaySection, {
			day,
			config,
			mode,
			scheduling,
			onStartScheduling,
			onGhostNameChange,
			onGhostIconChange,
			windowStart
		}, day.date))
	});
}
//#endregion
//#region resources/js/features/weekly/components/RecurrenceBar.tsx
var FREQ_OPTIONS = [
	{
		label: "Daily",
		value: "daily"
	},
	{
		label: "Weekdays",
		value: "weekly"
	},
	{
		label: "Custom",
		value: "custom"
	}
];
var ALL_DAYS = WEEK_DAYS.map((d) => d.value);
var WEEKDAYS = [
	1,
	2,
	3,
	4,
	5
];
function RecurrenceBar({ time, frequency, daysOfWeek, conflictCount = 0, onChange, onConfirm, onCancel }) {
	function handleFrequency(freq) {
		if (freq === "daily") onChange("daily", ALL_DAYS);
		else if (freq === "weekly") onChange("weekly", WEEKDAYS);
		else onChange("custom", daysOfWeek);
	}
	function toggleDay(day) {
		if (frequency !== "custom") return;
		onChange("custom", daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day].sort((a, b) => a - b));
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "recurrence-bar",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "recurrence-bar__time",
				children: time
			}),
			/* @__PURE__ */ jsx("div", {
				className: "recurrence-bar__freq-group",
				role: "group",
				"aria-label": "Frequency",
				children: FREQ_OPTIONS.map((opt) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: ["recurrence-bar__freq-btn", frequency === opt.value ? "recurrence-bar__freq-btn--active" : ""].filter(Boolean).join(" "),
					onClick: () => handleFrequency(opt.value),
					children: opt.label
				}, opt.value))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "recurrence-bar__days",
				role: "group",
				"aria-label": "Days of week",
				children: WEEK_DAYS.map((day) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: ["recurrence-bar__day-pill", daysOfWeek.includes(day.value) ? "recurrence-bar__day-pill--active" : ""].filter(Boolean).join(" "),
					"aria-label": day.full,
					"aria-pressed": daysOfWeek.includes(day.value),
					disabled: frequency !== "custom",
					onClick: () => toggleDay(day.value),
					children: day.label
				}, day.value))
			}),
			conflictCount > 0 && /* @__PURE__ */ jsxs("span", {
				className: "recurrence-bar__conflicts",
				title: `${conflictCount} time slot(s) already have a moment`,
				children: [
					"⚠️ ",
					conflictCount,
					" conflict",
					conflictCount > 1 ? "s" : ""
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "recurrence-bar__actions",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "recurrence-bar__cancel",
					onClick: onCancel,
					children: "✕"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "recurrence-bar__confirm",
					onClick: onConfirm,
					children: "✓ Confirm"
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Weekly/Index.tsx
/** Convert JS getDay() (0=Sun) to ISO day (1=Mon … 7=Sun) */
function jsToIsoDay(d) {
	return d === 0 ? 7 : d;
}
function Index({ weekStart, config, days }) {
	const [mode, setMode] = useState("overview");
	const [scheduling, setScheduling] = useState(null);
	const [showingModal, setShowingModal] = useState(false);
	const [modalDefaults, setModalDefaults] = useState();
	function handleModalClose() {
		setShowingModal(false);
		setModalDefaults(void 0);
	}
	function handleModalSubmit(_data, form) {
		form.transform((d) => ({
			...d,
			_redirect: route("weekly")
		}));
		form.post(route("moments.store"), {
			onSuccess: () => handleModalClose(),
			onError: () => {}
		});
	}
	function handleStartScheduling(date, time) {
		jsToIsoDay(new Date(date).getDay());
		setScheduling({
			time,
			frequency: "weekly",
			daysOfWeek: [
				1,
				2,
				3,
				4,
				5
			],
			name: "",
			icon: null
		});
	}
	function handleSchedulingChange(frequency, daysOfWeek) {
		setScheduling((prev) => prev ? {
			...prev,
			frequency,
			daysOfWeek
		} : null);
	}
	function handleSchedulingNameChange(name) {
		setScheduling((prev) => prev ? {
			...prev,
			name
		} : null);
	}
	function handleSchedulingIconChange(icon) {
		setScheduling((prev) => prev ? {
			...prev,
			icon
		} : null);
	}
	function handleConfirmSchedule() {
		if (!scheduling) return;
		router.post(route("moments.store"), {
			name: scheduling.name.trim() || null,
			frequency: scheduling.frequency,
			days_of_week: scheduling.daysOfWeek,
			preferred_time: scheduling.time,
			icon: scheduling.icon,
			_redirect: route("weekly")
		}, {
			preserveScroll: true,
			onSuccess: () => setScheduling(null)
		});
	}
	function handleExitConfigure() {
		setMode("overview");
		setScheduling(null);
	}
	const conflictCount = scheduling ? days.reduce((count, day) => {
		const iso = jsToIsoDay(new Date(day.date).getDay());
		if (!scheduling.daysOfWeek.includes(iso)) return count;
		return count + (day.slots.some((s) => s.time === scheduling.time && s.moment !== null) ? 1 : 0);
	}, 0) : 0;
	const dayLabels = WEEK_DAYS.map((d) => d.label);
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "weekly-header",
			children: [/* @__PURE__ */ jsx(DateSelectorBar, {
				mode: "week",
				weekStart
			}), mode === "overview" ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-header__mode-btn",
				title: "Configure schedule",
				onClick: () => setMode("configure"),
				children: "⚙️"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-header__mode-btn weekly-header__mode-btn--done",
				onClick: handleExitConfigure,
				children: "✕ Done"
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Weekly" }),
			mode === "configure" && scheduling && /* @__PURE__ */ jsx(RecurrenceBar, {
				time: scheduling.time,
				frequency: scheduling.frequency,
				daysOfWeek: scheduling.daysOfWeek,
				dayLabels,
				conflictCount,
				onChange: handleSchedulingChange,
				onConfirm: handleConfirmSchedule,
				onCancel: () => setScheduling(null)
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(WeeklyGrid, {
						days,
						config,
						mode,
						scheduling,
						onStartScheduling: handleStartScheduling,
						onGhostNameChange: handleSchedulingNameChange,
						onGhostIconChange: handleSchedulingIconChange
					})
				})
			}),
			/* @__PURE__ */ jsx(MomentModal, {
				show: showingModal,
				onClose: handleModalClose,
				defaultValues: modalDefaults,
				onSubmit: handleModalSubmit
			})
		]
	});
}
//#endregion
export { Index as default };
