import { C as CalendarNav, S as SchedulingKind, _ as CalendarProgressBar, c as WEEK_DAYS, h as jsToIsoDay, r as FrequencyBadge, t as Authenticated } from "./AuthenticatedLayout-C7pEbEWX.js";
import { a as WeeklyView, t as useScheduling } from "./scheduling-C30JLRPl.js";
import { t as MomentModal } from "./moments-BHnS6FXT.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { addWeeks, endOfISOWeek, format, parseISO, startOfISOWeek, subWeeks } from "date-fns";
//#region resources/js/Pages/Weekly/Index.tsx
var WEEKDAYS = [
	1,
	2,
	3,
	4,
	5
];
function Index({ weekStart, config, days, completedCount, totalCount }) {
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
			kind: SchedulingKind.Recurring,
			daysOfWeek: isWeekday ? [...WEEKDAYS] : [clickedIso],
			time,
			anchorDate: date,
			name: "",
			icon: null
		});
	}
	function handleFrequencyChange(frequency, daysOfWeek) {
		if (frequency === "once") {
			scheduling.setKind(SchedulingKind.OneOff, weekStart);
			return;
		}
		scheduling.setKind(SchedulingKind.Recurring, weekStart);
		scheduling.setDaysOfWeek(daysOfWeek);
	}
	const schedulingState = scheduling.state;
	const frequencyForBar = !schedulingState ? "once" : schedulingState.kind === SchedulingKind.OneOff ? "once" : schedulingState.daysOfWeek.length === 7 ? "daily" : schedulingState.daysOfWeek.length === WEEKDAYS.length && WEEKDAYS.every((d) => schedulingState.daysOfWeek.includes(d)) ? "weekly" : "custom";
	const daysOfWeekForBar = !schedulingState || schedulingState.kind === SchedulingKind.OneOff ? [] : schedulingState.daysOfWeek;
	const conflictCount = schedulingState ? days.reduce((count, day) => {
		if (schedulingState.kind === SchedulingKind.OneOff) {
			if (day.date !== schedulingState.date) return count;
		} else {
			const iso = jsToIsoDay(new Date(day.date).getDay());
			if (!schedulingState.daysOfWeek.includes(iso)) return count;
		}
		return count + (day.slots.some((s) => s.time === schedulingState.time && s.moment !== null) ? 1 : 0);
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
			children: [/* @__PURE__ */ jsxs("div", {
				className: "weekly-header__row",
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
			}), scheduling.mode === "overview" && totalCount > 0 && /* @__PURE__ */ jsx(CalendarProgressBar, {
				completedCount,
				totalCount
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Weekly" }),
			scheduling.mode === "configure" && schedulingState && /* @__PURE__ */ jsx(FrequencyBadge, {
				time: schedulingState.time,
				frequency: frequencyForBar,
				daysOfWeek: daysOfWeekForBar,
				dayLabels,
				conflictCount,
				onChange: handleFrequencyChange,
				onConfirm: scheduling.confirm,
				onCancel: scheduling.cancel
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(WeeklyView, {
						days,
						config,
						mode: scheduling.mode,
						scheduling: schedulingState,
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
