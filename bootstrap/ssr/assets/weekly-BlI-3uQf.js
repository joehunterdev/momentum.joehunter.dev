import { i as jsToIsoDay, n as computeWindowStart, r as isOutOfOffice } from "./AuthenticatedLayout-CSoRFjTv.js";
import { i as WEEK_DAYS } from "./moments-_MXcoxL1.js";
import { t as SlotMomentIcon } from "./SlotMomentIcon-QVGcRK4R.js";
import { n as MOMENT_ICONS } from "./icons-CTin_kzp.js";
import { router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { createPortal } from "react-dom";
//#region resources/js/shared/components/schedule/DayRowShell.tsx
/**
* Shared shell for any day-of-week row.
* Used by weekly DaySection (time slots as children)
* and monthly ScheduleRow (moment cards as children).
*/
function DayRowShell({ label, sublabel, badge, isToday = false, isWeekend = false, slotsLayout = "vertical", children }) {
	const sectionCls = [
		"weekly-day-section",
		isToday ? "weekly-day-section--today" : "",
		isWeekend ? "weekly-day-section--weekend" : ""
	].filter(Boolean).join(" ");
	const slotsCls = ["weekly-day-slots", slotsLayout === "horizontal" ? "weekly-day-slots--horizontal" : ""].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("section", {
		className: sectionCls,
		children: [/* @__PURE__ */ jsxs("header", {
			className: "weekly-day-header",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__name",
					children: label
				}),
				sublabel && /* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__date",
					children: sublabel
				}),
				badge && /* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__badge",
					children: badge
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: slotsCls,
			children
		})]
	});
}
//#endregion
//#region resources/js/features/weekly/components/SlotMomentCard.tsx
function SlotMomentCard({ moment, variant = "configure", onGhostNameChange, onGhostIconChange }) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickerStyle, setPickerStyle] = useState({});
	const iconBtnRef = useRef(null);
	useEffect(() => {
		if (!pickerOpen || !iconBtnRef.current) return;
		const rect = iconBtnRef.current.getBoundingClientRect();
		const pickerWidth = 224;
		const top = window.innerHeight - rect.bottom >= 260 ? rect.bottom + 6 : rect.top - 266;
		let left = rect.left;
		if (left + pickerWidth > window.innerWidth - 8) left = window.innerWidth - pickerWidth - 8;
		setPickerStyle({
			position: "fixed",
			top,
			left,
			width: pickerWidth,
			zIndex: 9999
		});
	}, [pickerOpen]);
	useEffect(() => {
		if (!pickerOpen) return;
		const close = (e) => {
			if (iconBtnRef.current && !iconBtnRef.current.contains(e.target)) setPickerOpen(false);
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [pickerOpen]);
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
				}), pickerOpen && createPortal(/* @__PURE__ */ jsx("div", {
					className: "ghost-icon-picker",
					style: pickerStyle,
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
				}), document.body)]
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
//#region resources/js/features/weekly/components/TimeSlotCell.tsx
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
		className: [cls, !slot.moment ? "weekly-slot--overview-empty" : ""].filter(Boolean).join(" "),
		children: [/* @__PURE__ */ jsx("span", {
			className: "weekly-slot__time",
			children: slot.time
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			children: slot.moment ? /* @__PURE__ */ jsx(SlotMomentCard, {
				moment: slot.moment,
				variant: "overview"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-slot__add-btn weekly-slot__add-btn--always-visible",
				title: `Add moment at ${slot.time}`,
				onClick: () => onStartScheduling(date, slot.time),
				onKeyDown: (e) => {
					if (e.key === "Enter" || e.key === " ") onStartScheduling(date, slot.time);
				},
				children: "+"
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
function DaySection({ day, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange, windowStart }) {
	const dateObj = parseISO(day.date);
	const visibleSlots = getWindowedSlots(day.slots, windowStart);
	const dayIso = jsToIsoDay(dateObj.getDay());
	return /* @__PURE__ */ jsx(DayRowShell, {
		label: day.dayName,
		sublabel: format(dateObj, "d MMM"),
		badge: day.isToday ? "Today" : void 0,
		isToday: day.isToday,
		isWeekend: day.isWeekend,
		slotsLayout: "vertical",
		children: visibleSlots.map((slot) => {
			const schedulingThisDay = scheduling !== null && slot.time === scheduling.time && (scheduling.frequency === "once" ? day.date === scheduling.date : scheduling.daysOfWeek.includes(dayIso));
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
	});
}
//#endregion
//#region resources/js/features/weekly/components/WeeklyGrid.tsx
var VISIBLE_SLOTS = 6;
function WeeklyGrid({ days, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	const windowStart = computeWindowStart(Array.from(new Set(days.flatMap((d) => d.slots.map((s) => s.time).filter((t) => t.endsWith(":00"))))).sort(), VISIBLE_SLOTS);
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
//#region resources/js/features/weekly/components/FrequencyBar.tsx
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
	},
	{
		label: "Once",
		value: "once"
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
function FrequencyBar({ time, frequency, daysOfWeek, conflictCount = 0, onChange, onConfirm, onCancel }) {
	function handleFrequency(freq) {
		if (freq === "daily") onChange("daily", ALL_DAYS);
		else if (freq === "weekly") onChange("weekly", WEEKDAYS);
		else if (freq === "once") onChange("once", []);
		else onChange("custom", daysOfWeek);
	}
	function toggleDay(day) {
		if (frequency !== "custom") return;
		onChange("custom", daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day].sort((a, b) => a - b));
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "frequency-bar",
		children: [
			time && /* @__PURE__ */ jsx("span", {
				className: "frequency-bar__time",
				children: time
			}),
			/* @__PURE__ */ jsx("div", {
				className: "frequency-bar__freq-group",
				role: "group",
				"aria-label": "Frequency",
				children: FREQ_OPTIONS.map((opt) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: ["frequency-bar__freq-btn", frequency === opt.value ? "frequency-bar__freq-btn--active" : ""].filter(Boolean).join(" "),
					onClick: () => handleFrequency(opt.value),
					children: opt.label
				}, opt.value))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "frequency-bar__days",
				role: "group",
				"aria-label": "Days of week",
				"aria-hidden": frequency === "once",
				style: frequency === "once" ? { display: "none" } : void 0,
				children: WEEK_DAYS.map((day) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: ["frequency-bar__day-pill", daysOfWeek.includes(day.value) ? "frequency-bar__day-pill--active" : ""].filter(Boolean).join(" "),
					"aria-label": day.full,
					"aria-pressed": daysOfWeek.includes(day.value),
					disabled: frequency !== "custom",
					onClick: () => toggleDay(day.value),
					children: day.label
				}, day.value))
			}),
			conflictCount > 0 && /* @__PURE__ */ jsxs("span", {
				className: "frequency-bar__conflicts",
				title: `${conflictCount} time slot(s) already have a moment`,
				children: [
					"⚠️ ",
					conflictCount,
					" conflict",
					conflictCount > 1 ? "s" : ""
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "frequency-bar__actions",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "frequency-bar__cancel",
					onClick: onCancel,
					children: "✕"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "frequency-bar__confirm",
					onClick: onConfirm,
					children: "✓ Confirm"
				})]
			})
		]
	});
}
//#endregion
export { DayRowShell as i, WeeklyGrid as n, SlotMomentCard as r, FrequencyBar as t };
