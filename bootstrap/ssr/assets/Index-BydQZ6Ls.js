import { a as CalendarNav, r as isOutOfOffice, t as Authenticated } from "./AuthenticatedLayout-DRUbBYy0.js";
import { a as DayRowShell, i as SlotMomentIcon, r as SlotMomentCard, t as FrequencyBar } from "./weekly-DQhQCWNH.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";
//#region resources/js/features/weekly/components/ConsistencyBar.tsx
/**
* Thin horizontal progress pill.
* Colour gradient: red (0) → orange → yellow → green (100).
*/
function ConsistencyBar({ score }) {
	const clamped = Math.min(100, Math.max(0, score));
	return /* @__PURE__ */ jsx("div", {
		className: "consistency-bar",
		title: `${clamped}% consistency`,
		children: /* @__PURE__ */ jsx("div", {
			className: "consistency-bar__fill",
			style: { width: `${clamped}%` }
		})
	});
}
//#endregion
//#region resources/js/features/weekly/components/MomentDetailTicker.tsx
function buildSlides(moment) {
	const slides = [];
	if (moment.description) slides.push({
		label: "About",
		text: moment.description
	});
	if (moment.implementation_intention) slides.push({
		label: "Cue",
		text: moment.implementation_intention
	});
	if (moment.habit_stack_after) slides.push({
		label: "Stack",
		text: moment.habit_stack_after
	});
	if (moment.environment_prompt) slides.push({
		label: "Env",
		text: moment.environment_prompt
	});
	return slides;
}
var shared = /* @__PURE__ */ new Map();
var listeners = /* @__PURE__ */ new Map();
function getState(moment) {
	if (!shared.has(moment.id)) {
		shared.set(moment.id, {
			active: 0,
			animating: false,
			slides: buildSlides(moment)
		});
		listeners.set(moment.id, /* @__PURE__ */ new Set());
	}
	return shared.get(moment.id);
}
function notify(id) {
	listeners.get(id)?.forEach((fn) => fn());
}
function useSharedTicker(moment) {
	const [, forceRender] = useState(0);
	useEffect(() => {
		getState(moment);
		const fn = () => forceRender((n) => n + 1);
		listeners.get(moment.id).add(fn);
		return () => {
			listeners.get(moment.id)?.delete(fn);
		};
	}, [moment.id]);
	return getState(moment);
}
function MomentDetailTicker({ moment, part }) {
	const state = useSharedTicker(moment);
	const textRef = useRef(null);
	const trackRef = useRef(null);
	const [shouldScroll, setShouldScroll] = useState(false);
	const timerRef = useRef(null);
	useEffect(() => {
		if (part !== "track") return;
		if (state.slides.length <= 1) return;
		timerRef.current = setTimeout(function tick() {
			const s = getState(moment);
			s.animating = true;
			notify(moment.id);
			setTimeout(() => {
				s.active = (s.active + 1) % s.slides.length;
				s.animating = false;
				notify(moment.id);
			}, 300);
			timerRef.current = setTimeout(tick, 5e3);
		}, 5e3);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [
		moment.id,
		state.slides.length,
		part
	]);
	useEffect(() => {
		if (part !== "track") return;
		const el = textRef.current;
		const track = trackRef.current;
		if (el && track) {
			const overflows = el.scrollWidth > track.clientWidth + 4;
			setShouldScroll(overflows);
			if (overflows) track.style.setProperty("--ticker-track-width", `${track.clientWidth}px`);
		}
	}, [state.active, part]);
	if (state.slides.length === 0) return null;
	const slide = state.slides[state.active];
	if (part === "badge") return /* @__PURE__ */ jsx("span", {
		className: "moment-detail-ticker__badge",
		children: slide?.label
	});
	return /* @__PURE__ */ jsxs("div", {
		ref: trackRef,
		className: `moment-detail-ticker__track${state.animating ? " moment-detail-ticker__track--out" : ""}`,
		children: [/* @__PURE__ */ jsx("span", {
			ref: textRef,
			className: `moment-detail-ticker__text${shouldScroll ? " moment-detail-ticker__text--scroll" : ""}`,
			children: slide?.text
		}), /* @__PURE__ */ jsx("span", {
			className: "moment-detail-ticker__fade",
			"aria-hidden": true
		})]
	});
}
//#endregion
//#region resources/js/features/daily/components/DailySlotCard.tsx
/**
* Daily variant of the slot moment card.
* Shows consistency bar, swipeable icon, name, and a rotating detail ticker.
*/
function DailySlotCard({ moment, date, isNext, onToggle, onSwipeProgress, swipeProgress = 0 }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `slot-moment-card${isNext ? " slot-moment-card--next" : ""}`,
		style: { "--drag-progress": swipeProgress },
		children: [moment.consistency !== null && /* @__PURE__ */ jsxs("div", {
			className: "slot-moment-card__top",
			children: [/* @__PURE__ */ jsx(ConsistencyBar, { score: moment.consistency }), /* @__PURE__ */ jsxs("span", {
				className: "slot-moment-card__score",
				children: [moment.consistency, "%"]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "slot-moment-card__row",
			children: [/* @__PURE__ */ jsx(SlotMomentIcon, {
				moment,
				date,
				onToggle,
				onSwipeProgress
			}), /* @__PURE__ */ jsxs("div", {
				className: "slot-moment-card__body",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "slot-moment-card__name-row",
					children: [/* @__PURE__ */ jsx("span", {
						className: "slot-moment-card__name",
						children: moment.name
					}), isNext && /* @__PURE__ */ jsx(MomentDetailTicker, {
						moment,
						part: "badge"
					})]
				}), isNext ? /* @__PURE__ */ jsx(MomentDetailTicker, {
					moment,
					part: "track"
				}) : moment.description && /* @__PURE__ */ jsx("span", {
					className: "slot-moment-card__desc",
					children: moment.description
				})]
			})]
		})]
	});
}
//#endregion
//#region resources/js/features/daily/components/DailyTimeSlotCell.tsx
function DailyTimeSlotCell({ slot, date, config, onToggleMoment, isToday, isNext, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	const [swipeProgress, setSwipeProgress] = useState(0);
	const [swipeDone, setSwipeDone] = useState(false);
	const ooo = !slot.moment && isOutOfOffice(slot.time, config);
	const isSchedulingThisSlot = scheduling !== null && slot.time === scheduling.time && (scheduling.frequency === "once" ? date === scheduling.date : true);
	const isGhost = isSchedulingThisSlot && !slot.moment;
	const isConflict = isSchedulingThisSlot && slot.moment !== null;
	const cls = [
		"weekly-slot",
		ooo ? "weekly-slot--ooo" : "",
		isToday ? "weekly-slot--today" : "",
		!slot.moment && !ooo && !isGhost ? "weekly-slot--empty" : "",
		slot.moment?.status === "completed" ? "weekly-slot--completed" : "",
		swipeProgress > 0 ? "weekly-slot--swiping" : "",
		swipeDone ? "weekly-slot--swipe-done" : "",
		mode === "configure" && !slot.moment && !ooo && !isGhost ? "weekly-slot--configure-empty" : ""
	].filter(Boolean).join(" ");
	function handleSwipeProgress(progress) {
		setSwipeProgress(progress);
	}
	function handleToggle(momentId, instanceId, date) {
		setSwipeDone(true);
		setSwipeProgress(0);
		setTimeout(() => setSwipeDone(false), 700);
		onToggleMoment(momentId, instanceId, date);
	}
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
			children: mode === "configure" && isGhost ? /* @__PURE__ */ jsx(SlotMomentCard, {
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
					environment_prompt: null
				},
				variant: "ghost",
				onGhostNameChange,
				onGhostIconChange
			}) : mode === "configure" && slot.moment && isConflict ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(DailySlotCard, {
				moment: slot.moment,
				date,
				isNext: false,
				onToggle: handleToggle,
				onSwipeProgress: handleSwipeProgress,
				swipeProgress
			}), /* @__PURE__ */ jsx("span", {
				className: "weekly-slot__conflict-badge",
				title: "Scheduling conflict",
				children: "⚠️"
			})] }) : slot.moment ? /* @__PURE__ */ jsx(DailySlotCard, {
				moment: slot.moment,
				date,
				isNext,
				onToggle: handleToggle,
				onSwipeProgress: handleSwipeProgress,
				swipeProgress
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
//#region resources/js/features/daily/components/DailyGrid.tsx
/** Returns true if this slot time falls on an interval boundary (every N minutes). */
function isIntervalBoundary(time, intervalMinutes) {
	const [, mm] = time.split(":").map(Number);
	return mm % intervalMinutes === 0;
}
/** All slots from wake through sleep at the configured interval. For today, anchors to current time. */
function getTodaySlots(slots, config, isToday, intervalMinutes) {
	const filtered = slots.filter((s) => isIntervalBoundary(s.time, intervalMinutes) && s.time >= config.wake_time && s.time < config.sleep_time);
	if (!isToday) return filtered;
	const now = /* @__PURE__ */ new Date();
	const cutoffMinutes = Math.max(0, now.getHours() * 60 + now.getMinutes() - 120);
	const snappedCutoff = cutoffMinutes - cutoffMinutes % intervalMinutes;
	const cutoffTime = `${String(Math.floor(snappedCutoff / 60)).padStart(2, "0")}:${String(snappedCutoff % 60).padStart(2, "0")}`;
	return filtered.filter((s) => s.time >= cutoffTime || s.moment !== null);
}
/**
* Next-day slots: all hourly slots from wake through sleep.
* Empty slots beyond the first few are trimmed — we show up to NEXT_DAY_MAX
* contiguous slots from wake, always including slots that have a moment.
*/
var NEXT_DAY_MAX = 6;
function getNextDaySlots(slots, config, intervalMinutes) {
	const filtered = slots.filter((s) => isIntervalBoundary(s.time, intervalMinutes) && s.time >= config.wake_time && s.time < config.sleep_time);
	let lastMomentIdx = -1;
	filtered.forEach((s, i) => {
		if (s.moment) lastMomentIdx = i;
	});
	const showUpTo = Math.max(NEXT_DAY_MAX, lastMomentIdx + 1);
	return filtered.slice(0, showUpTo);
}
function DailyGrid({ day, nextDay, config, onToggleMoment, nextMomentKey, mode, scheduling, onStartScheduling, onGhostNameChange, onGhostIconChange }) {
	const dateObj = parseISO(day.date);
	const intervalMinutes = 20;
	const visibleSlots = getTodaySlots(day.slots, config, day.isToday, intervalMinutes);
	const nextDaySlots = nextDay ? getNextDaySlots(nextDay.slots, config, intervalMinutes) : [];
	const showNextDay = nextDay && nextDaySlots.length > 0;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(DayRowShell, {
		label: day.dayName,
		sublabel: format(dateObj, "d MMMM yyyy"),
		badge: day.isToday ? "Today" : void 0,
		isToday: day.isToday,
		slotsLayout: "vertical",
		children: visibleSlots.map((slot) => /* @__PURE__ */ jsx(DailyTimeSlotCell, {
			slot,
			date: day.date,
			config,
			onToggleMoment,
			isToday: day.isToday,
			isNext: !!slot.moment && nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`,
			mode,
			scheduling,
			onStartScheduling,
			onGhostNameChange,
			onGhostIconChange
		}, `${day.date}-${slot.time}`))
	}), showNextDay && nextDay && /* @__PURE__ */ jsx(DayRowShell, {
		label: nextDay.dayName,
		sublabel: format(parseISO(nextDay.date), "d MMMM yyyy"),
		isToday: false,
		isWeekend: nextDay.isWeekend,
		slotsLayout: "vertical",
		children: nextDaySlots.map((slot) => /* @__PURE__ */ jsx(DailyTimeSlotCell, {
			slot,
			date: nextDay.date,
			config,
			onToggleMoment: () => {},
			isToday: false,
			isNext: false,
			mode,
			scheduling,
			onStartScheduling,
			onGhostNameChange,
			onGhostIconChange
		}, `${nextDay.date}-${slot.time}`))
	})] });
}
//#endregion
//#region resources/js/features/daily/components/DailyProgressBar.tsx
/**
* A simple fill bar showing X of Y moments done for the day.
*/
function DailyProgressBar({ completedCount, totalCount }) {
	const pct = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "daily-progress",
		title: `${completedCount} of ${totalCount} done`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "daily-progress__bar",
			children: /* @__PURE__ */ jsx("div", {
				className: "daily-progress__fill",
				style: { width: `${pct}%` }
			})
		}), /* @__PURE__ */ jsxs("span", {
			className: "daily-progress__label",
			children: [
				completedCount,
				" / ",
				totalCount
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Daily/Index.tsx
function Index({ date, day, nextDay, config, completedCount, totalCount }) {
	const [mode, setMode] = useState("overview");
	const [scheduling, setScheduling] = useState(null);
	function handleStartScheduling(time) {
		setMode("configure");
		setScheduling({
			date,
			time,
			frequency: "once",
			daysOfWeek: [],
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
			_redirect: route("daily", { date })
		}, {
			preserveScroll: true,
			onSuccess: () => {
				setScheduling(null);
				setMode("overview");
			}
		});
	}
	function handleCancelSchedule() {
		setScheduling(null);
		setMode("overview");
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
			}), mode === "overview" && totalCount > 0 && /* @__PURE__ */ jsx(DailyProgressBar, {
				completedCount,
				totalCount
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Daily" }),
			mode === "configure" && scheduling && /* @__PURE__ */ jsx(FrequencyBar, {
				time: scheduling.time,
				frequency: scheduling.frequency,
				daysOfWeek: scheduling.daysOfWeek,
				onChange: handleSchedulingChange,
				onCancel: handleCancelSchedule,
				onConfirm: handleConfirmSchedule
			}),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-2xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(DailyGrid, {
						day,
						nextDay,
						config,
						onToggleMoment: handleToggleMoment,
						nextMomentKey,
						mode,
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
