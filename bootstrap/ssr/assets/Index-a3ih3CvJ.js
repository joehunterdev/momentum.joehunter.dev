import { a as CalendarNav, t as Authenticated } from "./AuthenticatedLayout-CSoRFjTv.js";
import { Head, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
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
//#region resources/js/Pages/Monthly/Index.tsx
function Index({ month, monthStart, days }) {
	const current = parseISO(monthStart);
	const prev = subMonths(current, 1);
	const next = addMonths(current, 1);
	function handleDayClick(date) {
		router.visit(route("daily", { date }));
	}
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx(CalendarNav, {
			prevLabel: format(prev, "MMMM yyyy"),
			currentLabel: format(current, "MMMM yyyy"),
			nextLabel: format(next, "MMMM yyyy"),
			prevParam: { month: format(prev, "yyyy-MM") },
			nextParam: { month: format(next, "yyyy-MM") },
			routeName: "monthly"
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Monthly" }), /* @__PURE__ */ jsx("div", {
			className: "py-0 sm:py-6",
			children: /* @__PURE__ */ jsx("div", {
				className: "mx-auto max-w-5xl sm:px-6 lg:px-8",
				children: /* @__PURE__ */ jsx(MonthlyGrid, {
					days,
					onDayClick: handleDayClick
				})
			})
		})]
	});
}
//#endregion
export { Index as default };
