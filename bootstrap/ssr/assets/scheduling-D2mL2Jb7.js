import { router } from "@inertiajs/react";
import { useState } from "react";
//#region resources/js/features/scheduling/transition.ts
/**
* Flip a scheduling state between one-off and recurring without losing
* the fields that carry across (name, icon, time).
*
* `fallbackDate` is used to anchor the new state when there isn't a date
* to inherit (e.g. transitioning recurring → recurring, or seeding from
* a one-off without a date).
*/
function transitionKind(current, next, fallbackDate) {
	if (current.kind === next) return current;
	if (next === "one-off") return {
		kind: "one-off",
		date: current.kind === "recurring" ? current.anchorDate : fallbackDate,
		time: current.time,
		name: current.name,
		icon: current.icon
	};
	return {
		kind: "recurring",
		daysOfWeek: [],
		time: current.time,
		anchorDate: current.kind === "one-off" ? current.date : fallbackDate,
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
			if (!prev || prev.kind !== "recurring") return prev;
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
		const payload = state.kind === "one-off" ? {
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
export { useScheduling as t };
