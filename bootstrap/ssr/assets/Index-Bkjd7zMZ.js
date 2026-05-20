import { f as DailyTimeSlotCell, h as CalendarProgressBar, m as CalendarSection, n as MomentFrequencyConfig, r as CalendarSectionHeader, t as Authenticated, v as CalendarNav } from "./AuthenticatedLayout-C0YG6yYO.js";
import { t as useScheduling } from "./scheduling-D2mL2Jb7.js";
import { Head, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { addDays, format, parseISO, subDays } from "date-fns";
//#region resources/js/Pages/Daily/Index.tsx
var INTERVAL_MINUTES = 30;
/** Slots from wake → sleep. For today, anchor to (now - 2h) snapped to interval. */
function getVisibleSlots(slots, config, isToday) {
	const inWindow = slots.filter((s) => s.time >= config.wake_time && s.time < config.sleep_time);
	if (!isToday) return inWindow;
	const now = /* @__PURE__ */ new Date();
	const cutoffMinutes = Math.max(0, now.getHours() * 60 + now.getMinutes() - 120);
	const snappedCutoff = cutoffMinutes - cutoffMinutes % INTERVAL_MINUTES;
	const cutoffTime = `${String(Math.floor(snappedCutoff / 60)).padStart(2, "0")}:${String(snappedCutoff % 60).padStart(2, "0")}`;
	return inWindow.filter((s) => s.time >= cutoffTime || s.moment !== null);
}
function Index({ date, day, config, completedCount, totalCount }) {
	const scheduling = useScheduling({ redirectTo: route("daily", { date }) });
	function handleStartScheduling(time) {
		scheduling.start({
			kind: "one-off",
			date,
			time,
			name: "",
			icon: null
		});
	}
	async function handleToggleMoment(momentId, _instanceId, date) {
		const token = document.querySelector("meta[name=\"csrf-token\"]")?.content ?? "";
		await fetch(route("moments.toggle", { moment: momentId }), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-TOKEN": token,
				Accept: "application/json"
			},
			body: JSON.stringify({ date })
		});
		router.reload({ only: [
			"day",
			"completedCount",
			"totalCount"
		] });
	}
	const nextMomentKey = (() => {
		for (const slot of day.slots) if (slot.moment && slot.moment.status !== "completed") return `${day.date}:${slot.time}:${slot.moment.id}`;
		return null;
	})();
	const currentDate = parseISO(date);
	const prevDate = subDays(currentDate, 1);
	const nextDate = addDays(currentDate, 1);
	const visibleSlots = getVisibleSlots(day.slots, config, day.isToday);
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
