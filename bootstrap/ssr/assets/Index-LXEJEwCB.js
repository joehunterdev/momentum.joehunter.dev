import { C as CalendarNav, S as SchedulingKind, _ as CalendarProgressBar, c as WEEK_DAYS, i as MomentFrequencyConfig, t as Authenticated } from "./AuthenticatedLayout-C7pEbEWX.js";
import { i as MonthlyScheduleRow, r as MonthlyView, t as useScheduling } from "./scheduling-C30JLRPl.js";
import { Head } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { addMonths, format, parseISO, subMonths } from "date-fns";
//#region resources/js/Pages/Monthly/Index.tsx
var ALL_DAYS = [
	1,
	2,
	3,
	4,
	5,
	6,
	7
];
function Index({ month, monthStart, days, scheduleRows, completedCount, totalCount }) {
	const current = parseISO(monthStart);
	const prev = subMonths(current, 1);
	const next = addMonths(current, 1);
	const scheduling = useScheduling({ redirectTo: route("monthly", { month }) });
	function handleStartScheduling(_isoDay) {
		scheduling.start({
			kind: SchedulingKind.Recurring,
			daysOfWeek: [...ALL_DAYS],
			time: null,
			anchorDate: monthStart,
			name: "",
			icon: null
		});
	}
	const dayLabels = WEEK_DAYS.map((d) => d.label);
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "monthly-header",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "monthly-header__row",
				children: [/* @__PURE__ */ jsx(CalendarNav, {
					prevLabel: format(prev, "MMMM yyyy"),
					currentLabel: format(current, "MMMM yyyy"),
					nextLabel: format(next, "MMMM yyyy"),
					prevParam: { month: format(prev, "yyyy-MM") },
					nextParam: { month: format(next, "yyyy-MM") },
					routeName: "monthly"
				}), scheduling.mode === "overview" ? /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "monthly-header__mode-btn",
					title: "Configure schedule",
					onClick: () => scheduling.setMode("configure"),
					children: "⚙️"
				}) : /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "monthly-header__mode-btn monthly-header__mode-btn--done",
					onClick: scheduling.exit,
					children: "✕ Done"
				})]
			}), scheduling.mode === "overview" && totalCount > 0 && /* @__PURE__ */ jsx(CalendarProgressBar, {
				completedCount,
				totalCount
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Monthly" }),
			scheduling.mode === "configure" && scheduling.state && /* @__PURE__ */ jsx(MomentFrequencyConfig, {
				state: scheduling.state,
				dayLabels,
				onKindChange: (next) => scheduling.setKind(next, monthStart),
				onDaysChange: scheduling.setDaysOfWeek,
				onConfirm: scheduling.confirm,
				onCancel: scheduling.cancel
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-5xl sm:px-6 lg:px-8",
					children: scheduling.mode === "overview" ? /* @__PURE__ */ jsx(MonthlyView, {
						days,
						onStartScheduling: (date) => {
							scheduling.start({
								kind: SchedulingKind.Recurring,
								daysOfWeek: [...ALL_DAYS],
								time: null,
								anchorDate: date,
								name: "",
								icon: null
							});
						}
					}) : /* @__PURE__ */ jsx("div", {
						className: "weekly-grid",
						children: scheduleRows.map((row) => /* @__PURE__ */ jsx(MonthlyScheduleRow, {
							row,
							mode: scheduling.mode,
							scheduling: scheduling.state,
							onStartScheduling: handleStartScheduling,
							onDraftNameChange: scheduling.setName,
							onDraftIconChange: scheduling.setIcon
						}, row.isoDayNumber))
					})
				})
			})
		]
	});
}
//#endregion
export { Index as default };
