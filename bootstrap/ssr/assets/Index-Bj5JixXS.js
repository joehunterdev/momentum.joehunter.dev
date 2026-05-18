import { d as jsToIsoDay, f as CalendarSection, l as computeWindowStart, m as CalendarMomentCard, n as MomentFrequencyConfig, o as WEEK_DAYS, s as CalendarSectionHeader, t as Authenticated, u as isOutOfOffice, v as CalendarNav } from "./AuthenticatedLayout-DDNuBk6w.js";
import { t as useScheduling } from "./scheduling-D2mL2Jb7.js";
import { t as MomentModal } from "./moments-D1ngbCg3.js";
import { Head } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { addWeeks, endOfISOWeek, format, parseISO, startOfISOWeek, subWeeks } from "date-fns";
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
	if (mode === "overview") {
		const emptyClickable = !slot.moment;
		return /* @__PURE__ */ jsxs("div", {
			className: [cls, emptyClickable && !ooo ? "weekly-slot--overview-empty" : ""].filter(Boolean).join(" "),
			children: [/* @__PURE__ */ jsx("span", {
				className: `weekly-slot__time${emptyClickable ? " weekly-slot__time--clickable" : ""}`,
				onClick: emptyClickable ? () => onStartScheduling(date, slot.time) : void 0,
				title: emptyClickable ? `Add moment at ${slot.time}` : void 0,
				children: slot.time
			}), /* @__PURE__ */ jsx("div", {
				className: "weekly-slot__content",
				children: slot.moment ? /* @__PURE__ */ jsx(CalendarMomentCard, {
					moment: slot.moment,
					variant: "read"
				}) : ooo ? /* @__PURE__ */ jsx("span", {
					className: "weekly-slot__ooo-dot",
					"aria-hidden": true
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
	}
	const configEmptyClickable = !slot.moment && !isGhost && !ooo;
	return /* @__PURE__ */ jsxs("div", {
		className: cls,
		children: [/* @__PURE__ */ jsx("span", {
			className: `weekly-slot__time${configEmptyClickable ? " weekly-slot__time--clickable" : ""}`,
			onClick: configEmptyClickable ? () => onStartScheduling(date, slot.time) : void 0,
			title: configEmptyClickable ? `Add moment at ${slot.time}` : void 0,
			children: slot.time
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			style: { position: "relative" },
			children: isGhost ? /* @__PURE__ */ jsx(CalendarMomentCard, {
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
				variant: "draft",
				onDraftNameChange: onGhostNameChange,
				onDraftIconChange: onGhostIconChange
			}) : slot.moment ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(CalendarMomentCard, {
				moment: slot.moment,
				variant: "edit"
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
	return /* @__PURE__ */ jsx(CalendarSection, {
		isToday: day.isToday,
		isWeekend: day.isWeekend,
		layout: "vertical",
		header: /* @__PURE__ */ jsx(CalendarSectionHeader, {
			label: day.dayName,
			sublabel: format(dateObj, "d MMM"),
			badge: day.isToday ? "Today" : void 0
		}),
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
//#region resources/js/Pages/Weekly/Index.tsx
var WEEKDAYS = [
	1,
	2,
	3,
	4,
	5
];
/**
* Adapter: new discriminated-union scheduling state → legacy flat shape
* expected by <WeeklyGrid>. Removed when that migrates.
*/
function toLegacy(state, fallbackDate) {
	if (!state) return null;
	if (state.kind === "one-off") return {
		date: state.date,
		time: state.time,
		frequency: "once",
		daysOfWeek: [],
		name: state.name,
		icon: state.icon
	};
	const isAllDays = state.daysOfWeek.length === 7;
	const isWeekdays = state.daysOfWeek.length === WEEKDAYS.length && WEEKDAYS.every((d) => state.daysOfWeek.includes(d));
	const frequency = isAllDays ? "daily" : isWeekdays ? "weekly" : "custom";
	return {
		date: state.anchorDate || fallbackDate,
		time: state.time,
		frequency,
		daysOfWeek: state.daysOfWeek,
		name: state.name,
		icon: state.icon
	};
}
function Index({ weekStart, config, days }) {
	const scheduling = useScheduling({ redirectTo: route("weekly") });
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
		const clickedIso = jsToIsoDay(new Date(date).getDay());
		const isWeekday = clickedIso >= 1 && clickedIso <= 5;
		scheduling.start({
			kind: "recurring",
			daysOfWeek: isWeekday ? [...WEEKDAYS] : [clickedIso],
			time,
			anchorDate: date,
			name: "",
			icon: null
		});
	}
	const legacyScheduling = toLegacy(scheduling.state, weekStart);
	const conflictCount = legacyScheduling ? days.reduce((count, day) => {
		if (legacyScheduling.frequency === "once") {
			if (day.date !== legacyScheduling.date) return count;
		} else {
			const iso = jsToIsoDay(new Date(day.date).getDay());
			if (!legacyScheduling.daysOfWeek.includes(iso)) return count;
		}
		return count + (day.slots.some((s) => s.time === legacyScheduling.time && s.moment !== null) ? 1 : 0);
	}, 0) : 0;
	const dayLabels = WEEK_DAYS.map((d) => d.label);
	const currentWeekStart = startOfISOWeek(parseISO(weekStart));
	const prevWeekStart = subWeeks(currentWeekStart, 1);
	const nextWeekStart = addWeeks(currentWeekStart, 1);
	function weekLabel(start) {
		return `${format(start, "d MMM")} – ${format(endOfISOWeek(start), "d MMM")}`;
	}
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "weekly-header",
			children: [/* @__PURE__ */ jsx(CalendarNav, {
				prevLabel: weekLabel(prevWeekStart),
				currentLabel: weekLabel(currentWeekStart),
				nextLabel: weekLabel(nextWeekStart),
				prevParam: { week: format(prevWeekStart, "yyyy-MM-dd") },
				nextParam: { week: format(nextWeekStart, "yyyy-MM-dd") },
				routeName: "weekly"
			}), scheduling.mode === "overview" ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-header__mode-btn",
				title: "Configure schedule",
				onClick: () => scheduling.setMode("configure"),
				children: "⚙️"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-header__mode-btn weekly-header__mode-btn--done",
				onClick: scheduling.exit,
				children: "✕ Done"
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Weekly" }),
			scheduling.mode === "configure" && scheduling.state && /* @__PURE__ */ jsx(MomentFrequencyConfig, {
				state: scheduling.state,
				time: scheduling.state.time,
				dayLabels,
				conflictCount,
				onKindChange: (next) => scheduling.setKind(next, weekStart),
				onDaysChange: scheduling.setDaysOfWeek,
				onConfirm: scheduling.confirm,
				onCancel: scheduling.cancel
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(WeeklyGrid, {
						days,
						config,
						mode: scheduling.mode,
						scheduling: legacyScheduling,
						onStartScheduling: handleStartScheduling,
						onGhostNameChange: scheduling.setName,
						onGhostIconChange: scheduling.setIcon
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
