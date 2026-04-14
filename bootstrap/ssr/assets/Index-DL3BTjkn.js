import { t as Authenticated } from "./AuthenticatedLayout-Boxls7xi.js";
import { n as SlotMomentIcon, t as DateSelectorBar } from "./calendar-DnbwfYs_.js";
import { Head, router } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
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
function DailySlotCard({ moment, date, isNext, onToggle, onSwipeProgress }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `slot-moment-card${isNext ? " slot-moment-card--next" : ""}`,
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
function isOutOfOffice(time, config) {
	return time < config.office_start || time >= config.office_end;
}
function DailyTimeSlotCell({ slot, date, config, onToggleMoment, isToday, isNext }) {
	const [swipeProgress, setSwipeProgress] = useState(0);
	const [swipeDone, setSwipeDone] = useState(false);
	const ooo = !slot.moment && isOutOfOffice(slot.time, config);
	const cls = [
		"weekly-slot",
		ooo ? "weekly-slot--ooo" : "",
		isToday ? "weekly-slot--today" : "",
		!slot.moment && !ooo ? "weekly-slot--empty" : "",
		slot.moment?.status === "completed" ? "weekly-slot--completed" : "",
		swipeProgress > 0 ? "weekly-slot--swiping" : "",
		swipeDone ? "weekly-slot--swipe-done" : ""
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
	return /* @__PURE__ */ jsxs("div", {
		className: cls,
		style: swipeProgress > 0 ? { "--swipe-progress": swipeProgress } : void 0,
		children: [/* @__PURE__ */ jsx("span", {
			className: "weekly-slot__time",
			children: slot.time
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			children: slot.moment ? /* @__PURE__ */ jsx(DailySlotCard, {
				moment: slot.moment,
				date,
				isNext,
				onToggle: handleToggle,
				onSwipeProgress: handleSwipeProgress
			}) : ooo ? /* @__PURE__ */ jsx("span", {
				className: "weekly-slot__ooo-dot",
				"aria-hidden": true
			}) : /* @__PURE__ */ jsx("span", { className: "weekly-slot__empty-label" })
		})]
	});
}
//#endregion
//#region resources/js/features/daily/components/DailyGrid.tsx
var VISIBLE_SLOTS = 8;
/**
* Keep only on-the-hour slots, then window to VISIBLE_SLOTS centred near
* the current time (today) or from wake time (past/future days).
* Slots with a moment are always included regardless of the window.
*/
function getVisibleSlots(slots, isToday) {
	const hourly = slots.filter((s) => s.time.endsWith(":00"));
	if (!isToday || hourly.length <= VISIBLE_SLOTS) return hourly.slice(0, VISIBLE_SLOTS);
	const nowMins = (/* @__PURE__ */ new Date()).getHours() * 60 + (/* @__PURE__ */ new Date()).getMinutes();
	let anchorIdx = 0;
	let anchorDiff = Infinity;
	hourly.forEach((s, i) => {
		const [h] = s.time.split(":").map(Number);
		const diff = Math.abs(h * 60 - nowMins);
		if (diff < anchorDiff) {
			anchorDiff = diff;
			anchorIdx = i;
		}
	});
	const start = Math.max(0, Math.min(anchorIdx - 2, hourly.length - VISIBLE_SLOTS));
	const windowed = new Set(hourly.slice(start, start + VISIBLE_SLOTS).map((s) => s.time));
	hourly.forEach((s) => {
		if (s.moment) windowed.add(s.time);
	});
	return hourly.filter((s) => windowed.has(s.time));
}
/**
* How many tomorrow slots to show to fill the remaining whitespace.
* Only slots that have a moment are shown — empty tomorrow slots are skipped.
*/
function getTomorrowPreviewSlots(todaySlots, nextDay) {
	const remaining = VISIBLE_SLOTS - todaySlots.length;
	if (remaining <= 0) return [];
	return nextDay.slots.filter((s) => s.time.endsWith(":00")).filter((s) => s.moment !== null).slice(0, remaining);
}
function DailyGrid({ day, nextDay, config, onToggleMoment, nextMomentKey }) {
	const dateObj = parseISO(day.date);
	const visibleSlots = getVisibleSlots(day.slots, day.isToday);
	const tomorrowSlots = nextDay ? getTomorrowPreviewSlots(visibleSlots, nextDay) : [];
	return /* @__PURE__ */ jsxs("section", {
		className: "daily-grid",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "daily-grid__header",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "daily-grid__day-name",
						children: day.dayName
					}),
					/* @__PURE__ */ jsx("span", {
						className: "daily-grid__date",
						children: format(dateObj, "d MMMM yyyy")
					}),
					day.isToday && /* @__PURE__ */ jsx("span", {
						className: "daily-grid__today-badge",
						children: "Today"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "daily-grid__slots",
				children: visibleSlots.map((slot) => /* @__PURE__ */ jsx(DailyTimeSlotCell, {
					slot,
					date: day.date,
					config,
					onToggleMoment,
					isToday: day.isToday,
					isNext: !!slot.moment && nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`
				}, `${day.date}-${slot.time}`))
			}),
			tomorrowSlots.length > 0 && nextDay && /* @__PURE__ */ jsxs("div", {
				className: "daily-grid__tomorrow",
				children: [/* @__PURE__ */ jsx("div", {
					className: "daily-grid__tomorrow-label",
					children: /* @__PURE__ */ jsxs("span", { children: ["Tomorrow · ", format(parseISO(nextDay.date), "d MMM")] })
				}), /* @__PURE__ */ jsx("div", {
					className: "daily-grid__slots daily-grid__slots--tomorrow",
					children: tomorrowSlots.map((slot) => /* @__PURE__ */ jsx(DailyTimeSlotCell, {
						slot,
						date: nextDay.date,
						config,
						onToggleMoment: () => {},
						isToday: false,
						isNext: false
					}, `${nextDay.date}-${slot.time}`))
				})]
			})
		]
	});
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
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "daily-header",
			children: [/* @__PURE__ */ jsx(DateSelectorBar, {
				mode: "day",
				date
			}), totalCount > 0 && /* @__PURE__ */ jsx(DailyProgressBar, {
				completedCount,
				totalCount
			})]
		}),
		children: [/* @__PURE__ */ jsx(Head, { title: "Daily" }), /* @__PURE__ */ jsx("div", {
			className: "py-0 sm:py-6",
			children: /* @__PURE__ */ jsx("div", {
				className: "mx-auto max-w-2xl sm:px-6 lg:px-8",
				children: /* @__PURE__ */ jsx(DailyGrid, {
					day,
					nextDay,
					config,
					onToggleMoment: handleToggleMoment,
					nextMomentKey
				})
			})
		})]
	});
}
//#endregion
export { Index as default };
