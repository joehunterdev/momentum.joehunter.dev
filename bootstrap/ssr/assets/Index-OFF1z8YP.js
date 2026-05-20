import { C as CalendarNav, S as SchedulingKind, _ as CalendarProgressBar, g as CalendarSection, i as MomentFrequencyConfig, l as CalendarSectionHeader, p as getVisibleTimeSlots, t as Authenticated, x as MomentStatus } from "./AuthenticatedLayout-C7pEbEWX.js";
import { n as useCalendarActions, o as DailyTimeSlotCell, t as useScheduling } from "./scheduling-C30JLRPl.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { addDays, format, parseISO, subDays } from "date-fns";
//#region resources/js/Pages/Daily/Index.tsx
function Index({ date, day, config, completedCount, totalCount }) {
	const scheduling = useScheduling({ redirectTo: route("daily", { date }) });
	const { toggleMoment } = useCalendarActions();
	function handleStartScheduling(time) {
		scheduling.start({
			kind: SchedulingKind.OneOff,
			date,
			time,
			name: "",
			icon: null
		});
	}
	async function handleToggleMoment(momentId, _instanceId, date) {
		await toggleMoment({
			momentId,
			date,
			reloadOnly: [
				"day",
				"completedCount",
				"totalCount"
			]
		});
	}
	const nextMomentKey = (() => {
		for (const slot of day.slots) if (slot.moment && slot.moment.status !== MomentStatus.Completed) return `${day.date}:${slot.time}:${slot.moment.id}`;
		return null;
	})();
	const currentDate = parseISO(date);
	const prevDate = subDays(currentDate, 1);
	const nextDate = addDays(currentDate, 1);
	const visibleSlots = getVisibleTimeSlots(day.slots, config, day.isToday);
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "daily-header",
			children: [/* @__PURE__ */ jsx(CalendarNav, {
				prevLabel: format(prevDate, "EEE d MMM"),
				currentLabel: format(currentDate, "EEE d MMM"),
				nextLabel: format(nextDate, "EEE d MMM"),
				prevParam: { date: format(prevDate, "yyyy-MM-dd") },
				nextParam: { date: format(nextDate, "yyyy-MM-dd") },
				routeName: "daily"
			}), scheduling.mode === "overview" && totalCount > 0 && /* @__PURE__ */ jsx(CalendarProgressBar, {
				completedCount,
				totalCount
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Daily" }),
			scheduling.mode === "configure" && scheduling.state && /* @__PURE__ */ jsx(MomentFrequencyConfig, {
				state: scheduling.state,
				time: scheduling.state.time,
				onKindChange: (next) => scheduling.setKind(next, date),
				onDaysChange: scheduling.setDaysOfWeek,
				onCancel: scheduling.exit,
				onConfirm: scheduling.confirm
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-2xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(CalendarSection, {
						isToday: day.isToday,
						layout: "vertical",
						header: /* @__PURE__ */ jsx(CalendarSectionHeader, {
							label: day.dayName,
							sublabel: format(currentDate, "d MMMM yyyy"),
							badge: day.isToday ? "Today" : void 0
						}),
						children: visibleSlots.map((slot) => /* @__PURE__ */ jsx(DailyTimeSlotCell, {
							slot,
							date: day.date,
							config,
							onToggleMoment: handleToggleMoment,
							isToday: day.isToday,
							isNext: !!slot.moment && nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`,
							mode: scheduling.mode,
							scheduling: scheduling.state,
							onStartScheduling: handleStartScheduling,
							onGhostNameChange: scheduling.setName,
							onGhostIconChange: scheduling.setIcon
						}, `${day.date}-${slot.time}`))
					})
				})
			})
		]
	});
}
//#endregion
export { Index as default };
