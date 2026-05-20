import { c as CalendarSectionArticle, f as CalendarSection, n as MomentFrequencyConfig, o as WEEK_DAYS, p as CalendarProgressBar, s as CalendarSectionHeader, t as Authenticated, v as CalendarNav } from "./AuthenticatedLayout-DDNuBk6w.js";
import { t as useScheduling } from "./scheduling-D2mL2Jb7.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { addMonths, format, parseISO, subMonths } from "date-fns";
//#region resources/js/features/monthly/components/MonthlyDayCell.tsx
function MonthlyDayCell({ day, onDayClick }) {
	const dateObj = parseISO(day.date);
	const cellCls = [
		"monthly-day-cell",
		day.isToday ? "monthly-day-cell--today" : "",
		day.isWeekend ? "monthly-day-cell--weekend" : "",
		!day.isCurrentMonth ? "monthly-day-cell--faded" : ""
	].filter(Boolean).join(" ");
	const completionRatio = day.totalCount > 0 ? day.completedCount / day.totalCount : null;
	return /* @__PURE__ */ jsxs("div", {
		className: cellCls,
		role: onDayClick ? "button" : void 0,
		tabIndex: onDayClick ? 0 : void 0,
		onClick: () => onDayClick?.(day.date),
		onKeyDown: (e) => e.key === "Enter" && onDayClick?.(day.date),
		children: [/* @__PURE__ */ jsx("span", {
			className: `monthly-day-cell__date-num ${completionRatio === null ? "" : completionRatio === 1 ? "monthly-day-cell__date-num--complete" : completionRatio > 0 ? "monthly-day-cell__date-num--partial" : "monthly-day-cell__date-num--none"}`,
			children: format(dateObj, "d")
		}), day.moments.length > 0 && /* @__PURE__ */ jsxs("ul", {
			className: "monthly-day-cell__moments",
			children: [day.moments.slice(0, 3).map((m) => /* @__PURE__ */ jsx("li", {
				className: `monthly-day-cell__pip monthly-day-cell__pip--${m.status ?? "future"}`,
				title: m.name,
				children: m.icon ? /* @__PURE__ */ jsx("span", {
					className: "monthly-day-cell__pip-icon",
					children: m.icon
				}) : /* @__PURE__ */ jsx("span", {
					className: "monthly-day-cell__pip-dot",
					style: m.color ? { background: m.color } : void 0
				})
			}, m.id)), day.moments.length > 3 && /* @__PURE__ */ jsxs("li", {
				className: "monthly-day-cell__overflow",
				children: ["+", day.moments.length - 3]
			})]
		})]
	});
}
//#endregion
//#region resources/js/features/monthly/components/MonthlyGrid.tsx
var DAY_HEADERS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
function MonthlyGrid({ days, onDayClick }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "monthly-grid",
		children: [/* @__PURE__ */ jsx("div", {
			className: "monthly-grid__headers",
			children: DAY_HEADERS.map((d) => /* @__PURE__ */ jsx("div", {
				className: "monthly-grid__col-header",
				children: d
			}, d))
		}), /* @__PURE__ */ jsx("div", {
			className: "monthly-grid__cells",
			children: days.map((day) => /* @__PURE__ */ jsx(MonthlyDayCell, {
				day,
				onDayClick
			}, day.date))
		})]
	});
}
//#endregion
//#region resources/js/features/monthly/components/MonthlyScheduleRow.tsx
var WEEKEND_ISO_DAYS = [6, 7];
function toSlotMoment(m) {
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
		environment_prompt: m.cue?.environment_prompt ?? null
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
				moment: toSlotMoment(m),
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
//#region resources/js/features/monthly/components/MonthlyScheduleGrid.tsx
/**
* Monthly configure grid — 7 day-of-week rows (Mon–Sun).
* Each row uses the same CalendarSection as the weekly view,
* with CalendarSectionArticle for the per-moment cells.
*/
function MonthlyScheduleGrid({ rows, mode, scheduling, onStartScheduling, onDraftNameChange, onDraftIconChange }) {
	return /* @__PURE__ */ jsx("div", {
		className: "weekly-grid",
		children: rows.map((row) => /* @__PURE__ */ jsx(MonthlyScheduleRow, {
			row,
			mode,
			scheduling,
			onStartScheduling,
			onDraftNameChange,
			onDraftIconChange
		}, row.isoDayNumber))
	});
}
//#endregion
//#region resources/js/features/monthly/components/MonthlyVerticalView.tsx
/**
* Mobile-optimized vertical monthly view.
* Shows each day as a row with its moments, using CalendarSectionArticle
* for consistency with daily/weekly views (per calendar-components-refactor-plan.md §4.6).
*/
function MonthlyVerticalView({ days, mode, scheduling, onDayClick, onStartScheduling, onDraftNameChange, onDraftIconChange }) {
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	return /* @__PURE__ */ jsx("div", {
		className: "monthly-vertical-view",
		children: days.filter((day) => {
			const dayDate = parseISO(day.date);
			dayDate.setHours(0, 0, 0, 0);
			return day.moments.length > 0 || day.isToday || dayDate >= today;
		}).map((day) => {
			const dateObj = parseISO(day.date);
			const dayNumber = format(dateObj, "d");
			const monthName = format(dateObj, "MMM");
			return /* @__PURE__ */ jsx(CalendarSection, {
				isToday: day.isToday,
				isWeekend: day.isWeekend,
				layout: "vertical",
				header: /* @__PURE__ */ jsx(CalendarSectionHeader, {
					label: day.dayName,
					sublabel: `${dayNumber} ${monthName}`,
					badge: day.isToday ? "Today" : void 0
				}),
				children: day.moments.length > 0 ? day.moments.map((moment) => {
					const slotMoment = {
						id: moment.id,
						name: moment.name,
						icon: moment.icon,
						color: moment.color,
						status: moment.status,
						description: null,
						frequency: null,
						consistency: null,
						instance_id: null,
						implementation_intention: null,
						habit_stack_after: null,
						environment_prompt: null
					};
					return /* @__PURE__ */ jsx(CalendarSectionArticle, {
						slotKey: `${day.date}:${moment.id}`,
						date: day.date,
						moment: slotMoment,
						mode,
						scheduling,
						capabilities: {
							addOnEmpty: false,
							draftEdit: false,
							conflictBadge: false,
							editButton: true,
							outOfOffice: false
						}
					}, moment.id);
				}) : /* @__PURE__ */ jsx(CalendarSectionArticle, {
					slotKey: `${day.date}:empty`,
					date: day.date,
					moment: null,
					mode,
					scheduling,
					capabilities: {
						addOnEmpty: true,
						draftEdit: false,
						conflictBadge: false,
						editButton: false,
						outOfOffice: false
					},
					onStartScheduling: () => onStartScheduling(day.date)
				})
			}, day.date);
		})
	});
}
//#endregion
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
	function handleDayClick(date) {
		router.visit(route("daily", { date }));
	}
	function handleStartScheduling(_isoDay) {
		scheduling.start({
			kind: "recurring",
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
			children: [
				/* @__PURE__ */ jsx(CalendarNav, {
					prevLabel: format(prev, "MMMM yyyy"),
					currentLabel: format(current, "MMMM yyyy"),
					nextLabel: format(next, "MMMM yyyy"),
					prevParam: { month: format(prev, "yyyy-MM") },
					nextParam: { month: format(next, "yyyy-MM") },
					routeName: "monthly"
				}),
				scheduling.mode === "overview" && totalCount > 0 && /* @__PURE__ */ jsx(CalendarProgressBar, {
					completedCount,
					totalCount
				}),
				scheduling.mode === "overview" ? /* @__PURE__ */ jsx("button", {
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
				})
			]
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
					children: scheduling.mode === "overview" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
						className: "hidden md:block",
						children: /* @__PURE__ */ jsx(MonthlyGrid, {
							days,
							onDayClick: handleDayClick
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "block md:hidden",
						children: /* @__PURE__ */ jsx(MonthlyVerticalView, {
							days,
							mode: scheduling.mode,
							scheduling: scheduling.state,
							onDayClick: handleDayClick,
							onStartScheduling: (date) => {
								scheduling.start({
									kind: "recurring",
									daysOfWeek: [...ALL_DAYS],
									time: null,
									anchorDate: date,
									name: "",
									icon: null
								});
							},
							onDraftNameChange: scheduling.setName,
							onDraftIconChange: scheduling.setIcon
						})
					})] }) : /* @__PURE__ */ jsx(MonthlyScheduleGrid, {
						rows: scheduleRows,
						mode: scheduling.mode,
						scheduling: scheduling.state,
						onStartScheduling: handleStartScheduling,
						onDraftNameChange: scheduling.setName,
						onDraftIconChange: scheduling.setIcon
					})
				})
			})
		]
	});
}
//#endregion
export { Index as default };
