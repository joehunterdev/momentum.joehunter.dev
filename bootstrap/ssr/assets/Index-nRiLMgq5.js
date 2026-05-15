import { a as CalendarNav, i as jsToIsoDay, t as Authenticated } from "./AuthenticatedLayout-DRUbBYy0.js";
import { i as WEEK_DAYS } from "./moments-_MXcoxL1.js";
import { n as WeeklyGrid, t as FrequencyBar } from "./weekly-DQhQCWNH.js";
import { t as MomentModal } from "./moments-EpHXn8Ic.js";
import { Head, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { addWeeks, endOfISOWeek, format, parseISO, startOfISOWeek, subWeeks } from "date-fns";
//#region resources/js/Pages/Weekly/Index.tsx
function Index({ weekStart, config, days }) {
	const [mode, setMode] = useState("overview");
	const [scheduling, setScheduling] = useState(null);
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
		setMode("configure");
		setScheduling({
			date,
			time,
			frequency: "weekly",
			daysOfWeek: isWeekday ? [
				1,
				2,
				3,
				4,
				5
			] : [clickedIso],
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
			preferred_time: scheduling.time,
			icon: scheduling.icon,
			scheduled_date: scheduling.frequency === "once" ? scheduling.date : null,
			_redirect: route("weekly")
		}, {
			preserveScroll: true,
			onSuccess: () => setScheduling(null)
		});
	}
	function handleExitConfigure() {
		setMode("overview");
		setScheduling(null);
	}
	const conflictCount = scheduling ? days.reduce((count, day) => {
		if (scheduling.frequency === "once") {
			if (day.date !== scheduling.date) return count;
		} else {
			const iso = jsToIsoDay(new Date(day.date).getDay());
			if (!scheduling.daysOfWeek.includes(iso)) return count;
		}
		return count + (day.slots.some((s) => s.time === scheduling.time && s.moment !== null) ? 1 : 0);
	}, 0) : 0;
	const dayLabels = WEEK_DAYS.map((d) => d.label);
	const currentWeekStart = startOfISOWeek(parseISO(weekStart));
	const prevWeekStart = subWeeks(currentWeekStart, 1);
	const nextWeekStart = addWeeks(currentWeekStart, 1);
	function weekLabel(start) {
		return `${format(start, "d MMM")} \u2013 ${format(endOfISOWeek(start), "d MMM")}`;
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
			}), mode === "overview" ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-header__mode-btn",
				title: "Configure schedule",
				onClick: () => setMode("configure"),
				children: "⚙️"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "weekly-header__mode-btn weekly-header__mode-btn--done",
				onClick: handleExitConfigure,
				children: "✕ Done"
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Weekly" }),
			mode === "configure" && scheduling && /* @__PURE__ */ jsx(FrequencyBar, {
				time: scheduling.time,
				frequency: scheduling.frequency,
				daysOfWeek: scheduling.daysOfWeek,
				dayLabels,
				conflictCount,
				onChange: handleSchedulingChange,
				onConfirm: handleConfirmSchedule,
				onCancel: () => setScheduling(null)
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(WeeklyGrid, {
						days,
						config,
						mode,
						scheduling,
						onStartScheduling: handleStartScheduling,
						onGhostNameChange: handleSchedulingNameChange,
						onGhostIconChange: handleSchedulingIconChange
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
