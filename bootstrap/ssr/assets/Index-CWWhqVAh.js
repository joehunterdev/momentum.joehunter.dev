import { a as CalendarNav, t as Authenticated } from "./AuthenticatedLayout-DRUbBYy0.js";
import { i as WEEK_DAYS } from "./moments-_MXcoxL1.js";
import { a as DayRowShell, r as SlotMomentCard, t as FrequencyBar } from "./weekly-DQhQCWNH.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
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
//#region resources/js/features/monthly/components/MomentSlotCell.tsx
/**
* Single slot cell for the monthly configure grid.
* Mirrors TimeSlotCell but holds a moment (no time label, no OOO).
*/
function MomentSlotCell({ moment, isGhost, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	const cls = [
		"weekly-slot",
		"weekly-slot--no-time",
		isGhost ? "weekly-slot--ghost" : "",
		!moment && !isGhost ? "weekly-slot--overview-empty" : ""
	].filter(Boolean).join(" ");
	const ghostMoment = {
		id: 0,
		name: scheduling?.name || "New Moment",
		description: null,
		icon: scheduling?.icon ?? null,
		color: null,
		frequency: scheduling?.frequency ?? "weekly",
		consistency: null,
		status: null,
		instance_id: null,
		implementation_intention: null,
		habit_stack_after: null,
		environment_prompt: null
	};
	const existingMoment = moment ? {
		id: moment.id,
		name: moment.name,
		description: moment.description ?? null,
		icon: moment.icon ?? null,
		color: moment.color ?? null,
		frequency: moment.schedule?.frequency ?? null,
		consistency: null,
		status: null,
		instance_id: null,
		implementation_intention: null,
		habit_stack_after: null,
		environment_prompt: null
	} : null;
	return /* @__PURE__ */ jsx("div", {
		className: cls,
		children: /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			children: isGhost ? /* @__PURE__ */ jsx(SlotMomentCard, {
				moment: ghostMoment,
				variant: "ghost",
				onGhostNameChange,
				onGhostIconChange
			}) : existingMoment ? /* @__PURE__ */ jsx(SlotMomentCard, {
				moment: existingMoment,
				variant: "configure"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-slot__add-btn weekly-slot__add-btn--always-visible",
				title: "Schedule a moment on this day",
				onClick: onStartScheduling,
				children: "+"
			})
		})
	});
}
//#endregion
//#region resources/js/features/monthly/components/MonthlyScheduleRow.tsx
var WEEKEND_DAYS = [6, 7];
function MonthlyScheduleRow({ row, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	const isWeekend = WEEKEND_DAYS.includes(row.isoDayNumber);
	const schedulingThisDay = scheduling !== null && scheduling.frequency !== "once" && scheduling.daysOfWeek.includes(row.isoDayNumber);
	return /* @__PURE__ */ jsxs(DayRowShell, {
		label: row.dayLabel,
		isWeekend,
		slotsLayout: "horizontal",
		children: [
			row.moments.map((m) => /* @__PURE__ */ jsx(MomentSlotCell, {
				moment: m,
				isGhost: false,
				scheduling,
				onStartScheduling: () => onStartScheduling(row.isoDayNumber),
				onGhostNameChange,
				onGhostIconChange
			}, m.id)),
			schedulingThisDay && /* @__PURE__ */ jsx(MomentSlotCell, {
				moment: null,
				isGhost: true,
				scheduling,
				onStartScheduling: () => onStartScheduling(row.isoDayNumber),
				onGhostNameChange,
				onGhostIconChange
			}, "ghost"),
			/* @__PURE__ */ jsx(MomentSlotCell, {
				moment: null,
				isGhost: false,
				scheduling: null,
				onStartScheduling: () => onStartScheduling(row.isoDayNumber),
				onGhostNameChange,
				onGhostIconChange
			}, "add")
		]
	});
}
//#endregion
//#region resources/js/features/monthly/components/MonthlyScheduleGrid.tsx
/**
* Monthly configure grid — 7 day-of-week rows (Mon–Sun).
* Each row uses the same DayRowShell as the weekly view,
* with MomentSlotCells instead of TimeSlotCells.
*/
function MonthlyScheduleGrid({ rows, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	return /* @__PURE__ */ jsx("div", {
		className: "weekly-grid",
		children: rows.map((row) => /* @__PURE__ */ jsx(MonthlyScheduleRow, {
			row,
			scheduling,
			onStartScheduling,
			onGhostNameChange,
			onGhostIconChange
		}, row.isoDayNumber))
	});
}
//#endregion
//#region resources/js/features/monthly/components/MonthlyVerticalView.tsx
/**
* Mobile-optimized vertical monthly view.
* Shows each day as a row with its moments, like daily/weekly views.
*/
function MonthlyVerticalView({ days, onDayClick }) {
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
			return /* @__PURE__ */ jsx(DayRowShell, {
				label: day.dayName,
				sublabel: `${dayNumber} ${monthName}`,
				badge: day.isToday ? "Today" : void 0,
				isToday: day.isToday,
				isWeekend: day.isWeekend,
				slotsLayout: "vertical",
				children: day.moments.length > 0 ? /* @__PURE__ */ jsx("div", {
					className: "weekly-day-slots",
					children: day.moments.map((moment) => {
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
						return /* @__PURE__ */ jsx("div", {
							className: `weekly-slot ${moment.status === "completed" ? "weekly-slot--completed" : ""}`,
							children: /* @__PURE__ */ jsx(SlotMomentCard, {
								moment: slotMoment,
								variant: "overview"
							})
						}, moment.id);
					})
				}) : /* @__PURE__ */ jsx("div", {
					className: "weekly-day-slots",
					children: /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "weekly-slot weekly-slot--empty weekly-slot--overview-empty",
						onClick: () => onDayClick(day.date),
						children: /* @__PURE__ */ jsx("span", {
							className: "weekly-slot__add-btn-text",
							children: "+ Add moments"
						})
					})
				})
			}, day.date);
		})
	});
}
//#endregion
//#region resources/js/Pages/Monthly/Index.tsx
function Index({ month, monthStart, days, scheduleRows }) {
	const current = parseISO(monthStart);
	const prev = subMonths(current, 1);
	const next = addMonths(current, 1);
	const [mode, setMode] = useState("overview");
	const [scheduling, setScheduling] = useState(null);
	function handleDayClick(date) {
		router.visit(route("daily", { date }));
	}
	function handleStartScheduling(isoDay) {
		setScheduling({
			date: monthStart,
			time: null,
			frequency: "daily",
			daysOfWeek: [
				0,
				1,
				2,
				3,
				4,
				5,
				6
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
			days_of_week: scheduling.frequency !== "once" ? scheduling.daysOfWeek : null,
			preferred_time: null,
			icon: scheduling.icon,
			scheduled_date: null,
			_redirect: route("monthly", { month })
		}, {
			preserveScroll: true,
			onSuccess: () => setScheduling(null)
		});
	}
	function handleExitConfigure() {
		setMode("overview");
		setScheduling(null);
	}
	const dayLabels = WEEK_DAYS.map((d) => d.label);
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "monthly-header",
			children: [/* @__PURE__ */ jsx(CalendarNav, {
				prevLabel: format(prev, "MMMM yyyy"),
				currentLabel: format(current, "MMMM yyyy"),
				nextLabel: format(next, "MMMM yyyy"),
				prevParam: { month: format(prev, "yyyy-MM") },
				nextParam: { month: format(next, "yyyy-MM") },
				routeName: "monthly"
			}), mode === "overview" ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "monthly-header__mode-btn",
				title: "Configure schedule",
				onClick: () => setMode("configure"),
				children: "⚙️"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "monthly-header__mode-btn monthly-header__mode-btn--done",
				onClick: handleExitConfigure,
				children: "✕ Done"
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Monthly" }),
			mode === "configure" && scheduling && /* @__PURE__ */ jsx(FrequencyBar, {
				frequency: scheduling.frequency,
				daysOfWeek: scheduling.daysOfWeek,
				dayLabels,
				onChange: handleSchedulingChange,
				onConfirm: handleConfirmSchedule,
				onCancel: () => setScheduling(null)
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-5xl sm:px-6 lg:px-8",
					children: mode === "overview" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
						className: "hidden md:block",
						children: /* @__PURE__ */ jsx(MonthlyGrid, {
							days,
							onDayClick: handleDayClick
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "block md:hidden",
						children: /* @__PURE__ */ jsx(MonthlyVerticalView, {
							days,
							onDayClick: handleDayClick
						})
					})] }) : /* @__PURE__ */ jsx(MonthlyScheduleGrid, {
						rows: scheduleRows,
						scheduling,
						onStartScheduling: handleStartScheduling,
						onGhostNameChange: handleSchedulingNameChange,
						onGhostIconChange: handleSchedulingIconChange
					})
				})
			})
		]
	});
}
//#endregion
export { Index as default };
