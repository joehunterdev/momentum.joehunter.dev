import { S as SchedulingKind, d as MomentDisplay, f as computeWindowStart, g as CalendarSection, h as jsToIsoDay, l as CalendarSectionHeader, m as isOutOfOffice, n as AddMomentPopover, u as CalendarSectionArticle, v as CalendarMomentCard, x as MomentStatus } from "./AuthenticatedLayout-C7pEbEWX.js";
import { router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from "react";
import { format, parseISO, startOfDay, startOfISOWeek } from "date-fns";
//#region resources/js/features/calendar/components/DailyTimeSlotCell.tsx
function DailyTimeSlotCell({ slot, date, config, onToggleMoment, isToday, isNext, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	const [swipeProgress, setSwipeProgress] = useState(0);
	const [swipeDone, setSwipeDone] = useState(false);
	const ooo = !slot.moment && isOutOfOffice(slot.time, config);
	const isSchedulingThisSlot = scheduling !== null && slot.time === scheduling.time && (scheduling.kind === SchedulingKind.OneOff ? date === scheduling.date : true);
	const isGhost = isSchedulingThisSlot && !slot.moment;
	const isConflict = isSchedulingThisSlot && slot.moment !== null;
	const cls = [
		"weekly-slot",
		ooo ? "weekly-slot--ooo" : "",
		isToday ? "weekly-slot--today" : "",
		!slot.moment && !ooo && !isGhost ? "weekly-slot--empty" : "",
		slot.moment?.status === MomentStatus.Completed ? "weekly-slot--completed" : "",
		swipeProgress > 0 ? "weekly-slot--swiping" : "",
		swipeDone ? "weekly-slot--swipe-done" : "",
		mode === "configure" && !slot.moment && !ooo && !isGhost ? "weekly-slot--configure-empty" : ""
	].filter(Boolean).join(" ");
	const emptyClickable = !slot.moment;
	const timeClickable = ooo && emptyClickable;
	return /* @__PURE__ */ jsxs("div", {
		className: cls,
		style: swipeProgress > 0 ? { "--swipe-progress": swipeProgress } : void 0,
		children: [/* @__PURE__ */ jsx("span", {
			className: `weekly-slot__time${timeClickable ? " weekly-slot__time--clickable" : ""}`,
			onClick: timeClickable ? () => onStartScheduling(slot.time) : void 0,
			title: timeClickable ? `Add moment at ${slot.time}` : void 0,
			children: slot.time
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			style: { position: "relative" },
			children: mode === "configure" && isGhost ? /* @__PURE__ */ jsx(CalendarMomentCard, {
				moment: {
					id: 0,
					name: scheduling?.name || "New Moment",
					description: null,
					status: null,
					color: null,
					icon: scheduling?.icon ?? null,
					frequency: null,
					consistency: null,
					instance_id: null,
					implementation_intention: null,
					habit_stack_after: null,
					environment_prompt: null,
					progress: null
				},
				variant: "draft",
				onDraftNameChange: onGhostNameChange,
				onDraftIconChange: onGhostIconChange
			}) : mode === "configure" && slot.moment && isConflict ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(CalendarMomentCard, {
				moment: slot.moment,
				variant: "edit"
			}), /* @__PURE__ */ jsx("span", {
				className: "weekly-slot__conflict-badge",
				title: "Scheduling conflict",
				children: "⚠️"
			})] }) : mode === "configure" && slot.moment ? /* @__PURE__ */ jsx(CalendarMomentCard, {
				moment: slot.moment,
				variant: "edit"
			}) : slot.moment ? /* @__PURE__ */ jsx("div", {
				className: "daily-time-slot-cell__moment",
				children: /* @__PURE__ */ jsx(MomentDisplay, { moment: slot.moment })
			}) : ooo ? /* @__PURE__ */ jsx("span", {
				className: "weekly-slot__ooo-dot",
				"aria-hidden": true
			}) : mode === "configure" && !isGhost ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-slot__add-btn",
				title: `Add moment at ${slot.time}`,
				onClick: () => onStartScheduling(slot.time),
				children: "+"
			}) : emptyClickable ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-slot__add-btn weekly-slot__add-btn--always-visible",
				title: `Add moment at ${slot.time}`,
				onClick: () => onStartScheduling(slot.time),
				children: "+"
			}) : /* @__PURE__ */ jsx("span", { className: "weekly-slot__empty-label" })
		})]
	});
}
//#endregion
//#region resources/js/features/calendar/components/TimeSlotCell.tsx
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
				children: slot.moment ? /* @__PURE__ */ jsx(MomentDisplay, { moment: slot.moment }) : ooo ? /* @__PURE__ */ jsx("span", {
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
					environment_prompt: null,
					progress: null
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
			}), /* @__PURE__ */ jsx(AddMomentPopover, {
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
//#region resources/js/features/calendar/components/DaySection.tsx
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
			const schedulingThisDay = scheduling !== null && slot.time === scheduling.time && (scheduling.kind === "one-off" ? day.date === scheduling.date : scheduling.daysOfWeek.includes(dayIso));
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
//#region resources/js/features/calendar/components/WeeklyView.tsx
var VISIBLE_SLOTS = 6;
function WeeklyView({ days, config, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
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
//#region resources/js/features/calendar/components/MonthlyScheduleRow.tsx
var WEEKEND_ISO_DAYS = [6, 7];
/**
* Converts full MomentData (entity with schedule/cue/reward) to SlotMomentData.
* Used for recurring schedule rows where we show moment templates, not instances.
*/
function toCalendarMoment(m) {
	return {
		id: m.id,
		name: m.name,
		description: m.description ?? null,
		icon: m.icon ?? null,
		color: m.color ?? null,
		frequency: m.schedule?.frequency ?? null,
		consistency: null,
		status: null,
		instance_id: null,
		implementation_intention: m.cue?.implementation_intention ?? null,
		habit_stack_after: m.cue?.habit_stack_after ?? null,
		environment_prompt: m.cue?.environment_prompt ?? null,
		progress: null
	};
}
function MonthlyScheduleRow({ row, mode, scheduling, onStartScheduling, onDraftNameChange, onDraftIconChange }) {
	const isWeekend = WEEKEND_ISO_DAYS.includes(row.isoDayNumber);
	const isoDayNumber = row.isoDayNumber;
	const targetsThisDay = scheduling !== null && scheduling.kind === "recurring" && scheduling.daysOfWeek.includes(isoDayNumber);
	return /* @__PURE__ */ jsxs(CalendarSection, {
		isWeekend,
		layout: "horizontal",
		header: /* @__PURE__ */ jsx(CalendarSectionHeader, { label: row.dayLabel }),
		children: [
			row.moments.map((m) => /* @__PURE__ */ jsx(CalendarSectionArticle, {
				slotKey: `${row.isoDayNumber}:moment-${m.id}`,
				isoDayNumber: row.isoDayNumber,
				moment: toCalendarMoment(m),
				mode,
				scheduling,
				capabilities: { editButton: true }
			}, m.id)),
			targetsThisDay && /* @__PURE__ */ jsx(CalendarSectionArticle, {
				slotKey: `${row.isoDayNumber}:draft`,
				isoDayNumber: row.isoDayNumber,
				moment: null,
				mode,
				scheduling,
				capabilities: { draftEdit: true },
				onDraftNameChange,
				onDraftIconChange
			}, "draft"),
			/* @__PURE__ */ jsx(CalendarSectionArticle, {
				slotKey: `${row.isoDayNumber}:add`,
				isoDayNumber: row.isoDayNumber,
				moment: null,
				mode,
				scheduling: null,
				capabilities: { addOnEmpty: true },
				onStartScheduling: () => onStartScheduling(row.isoDayNumber)
			}, "add")
		]
	});
}
//#endregion
//#region resources/js/features/calendar/components/MonthlyView.tsx
function groupByIsoWeek(days) {
	const buckets = /* @__PURE__ */ new Map();
	for (const day of days) {
		const weekStart = format(startOfISOWeek(parseISO(day.date)), "yyyy-MM-dd");
		const bucket = buckets.get(weekStart) ?? [];
		bucket.push(day);
		buckets.set(weekStart, bucket);
	}
	return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([weekStartIso, days]) => ({
		weekStartIso,
		days
	}));
}
/**
* Mobile monthly view. Section = ISO week, article = one day (24h "slot").
* Each day-article carries the day label in its leading column and stacks any
* scheduled moments inside, or shows a `+` add button when empty.
*/
function MonthlyView({ days, onStartScheduling }) {
	const today = startOfDay(/* @__PURE__ */ new Date());
	return /* @__PURE__ */ jsx("div", {
		className: "monthly-vertical-view",
		children: groupByIsoWeek(days.some((d) => d.isToday) ? days.filter((d) => parseISO(d.date) >= today) : days).map(({ weekStartIso, days: weekDays }) => {
			return /* @__PURE__ */ jsx(CalendarSection, {
				layout: "vertical",
				header: /* @__PURE__ */ jsx(CalendarSectionHeader, { label: `Week of ${format(parseISO(weekStartIso), "d MMM")}` }),
				children: weekDays.map((day) => {
					const dayLabel = format(parseISO(day.date), "EEE d").toUpperCase();
					return /* @__PURE__ */ jsxs("div", {
						className: [
							"calendar-article",
							"weekly-slot",
							"weekly-slot--monthly-day",
							day.isToday && "calendar-article--today weekly-slot--today",
							day.isWeekend && "calendar-article--weekend weekly-slot--weekend"
						].filter(Boolean).join(" "),
						children: [/* @__PURE__ */ jsx("span", {
							className: "calendar-article__time weekly-slot__time",
							children: dayLabel
						}), /* @__PURE__ */ jsx("div", {
							className: "calendar-article__content weekly-slot__content",
							children: day.moments.length > 0 ? day.moments.map((m) => /* @__PURE__ */ jsx(MomentDisplay, { moment: m }, m.id)) : /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "calendar-article__add-btn weekly-slot__add-btn weekly-slot__add-btn--always-visible",
								title: `Add moment on ${dayLabel}`,
								onClick: () => onStartScheduling(day.date),
								children: "+"
							})
						})]
					}, day.date);
				})
			}, weekStartIso);
		})
	});
}
//#endregion
//#region resources/js/features/calendar/hooks/useCalendarActions.ts
function useCalendarActions() {
	return { toggleMoment: useCallback(async ({ momentId, date, time, reloadOnly }) => {
		return new Promise((resolve, reject) => {
			router.post(route("moments.toggle", { moment: momentId }), {
				date,
				time
			}, {
				only: reloadOnly ?? [
					"day",
					"days",
					"completedCount",
					"totalCount"
				],
				preserveScroll: true,
				onSuccess: () => resolve(),
				onError: () => reject(/* @__PURE__ */ new Error("Failed to toggle moment"))
			});
		});
	}, []) };
}
//#endregion
//#region resources/js/features/scheduling/transition.ts
/**
* Transition between one-off and recurring scheduling modes, preserving
* relevant fields and clearing contradictory ones.
*
* @param current - Current scheduling state
* @param next - Desired scheduling kind
* @param fallbackDate - Date to use if current state doesn't have a suitable date
* @returns New scheduling state with appropriate fields for the new kind
*/
function transitionKind(current, next, fallbackDate) {
	if (next === SchedulingKind.OneOff) return {
		kind: SchedulingKind.OneOff,
		date: current.kind === SchedulingKind.Recurring ? current.anchorDate : fallbackDate,
		time: current.time,
		name: current.name,
		icon: current.icon
	};
	return {
		kind: SchedulingKind.Recurring,
		daysOfWeek: [],
		time: current.time,
		anchorDate: current.kind === SchedulingKind.OneOff ? current.date : fallbackDate,
		name: current.name,
		icon: current.icon
	};
}
//#endregion
//#region resources/js/features/scheduling/useScheduling.ts
var WEEKDAYS = [
	1,
	2,
	3,
	4,
	5
];
function inferLegacyFrequency(days) {
	if (days.length === 7) return "daily";
	if (days.length === WEEKDAYS.length && WEEKDAYS.every((d) => days.includes(d))) return "weekly";
	return "custom";
}
function useScheduling({ redirectTo, onConfirm }) {
	const [mode, setMode] = useState("overview");
	const [state, setState] = useState(null);
	function start(seed) {
		setMode("configure");
		setState(seed);
	}
	function setKind(next, fallbackDate) {
		setState((prev) => prev ? transitionKind(prev, next, fallbackDate) : prev);
	}
	function setDaysOfWeek(days) {
		setState((prev) => {
			if (!prev || prev.kind !== SchedulingKind.Recurring) return prev;
			return {
				...prev,
				daysOfWeek: days
			};
		});
	}
	function setTime(time) {
		setState((prev) => prev ? {
			...prev,
			time
		} : prev);
	}
	function setName(name) {
		setState((prev) => prev ? {
			...prev,
			name
		} : prev);
	}
	function setIcon(icon) {
		setState((prev) => prev ? {
			...prev,
			icon
		} : prev);
	}
	function confirm() {
		if (!state) return;
		const payload = state.kind === SchedulingKind.OneOff ? {
			name: state.name.trim() || null,
			frequency: "once",
			days_of_week: null,
			preferred_time: state.time,
			icon: state.icon,
			scheduled_date: state.date
		} : {
			name: state.name.trim() || null,
			frequency: inferLegacyFrequency(state.daysOfWeek),
			days_of_week: state.daysOfWeek,
			preferred_time: state.time,
			icon: state.icon,
			scheduled_date: null
		};
		router.post(route("moments.store"), {
			...payload,
			_redirect: redirectTo
		}, {
			preserveScroll: true,
			onSuccess: () => {
				setState(null);
				setMode("overview");
				onConfirm?.();
			}
		});
	}
	function cancel() {
		setState(null);
	}
	function exit() {
		setMode("overview");
		setState(null);
	}
	return {
		mode,
		setMode,
		state,
		start,
		setKind,
		setDaysOfWeek,
		setTime,
		setName,
		setIcon,
		confirm,
		cancel,
		exit
	};
}
//#endregion
export { WeeklyView as a, MonthlyScheduleRow as i, useCalendarActions as n, DailyTimeSlotCell as o, MonthlyView as r, useScheduling as t };
