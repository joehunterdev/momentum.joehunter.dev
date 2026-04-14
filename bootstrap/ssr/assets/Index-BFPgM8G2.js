import { t as Authenticated } from "./AuthenticatedLayout-Q3C0CqN1.js";
import { t as MomentModal } from "./moments-Bjb9G-M3.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { addWeeks, endOfISOWeek, format, parseISO, startOfISOWeek, subWeeks } from "date-fns";
import { createPortal } from "react-dom";
//#region resources/js/features/weekly/components/AddSlotPopover.tsx
function AddSlotPopover({ isOpen, anchorRef, onClose, onSelectOnce, onSelectRecurring }) {
	const ref = useRef(null);
	const [coords, setCoords] = useState(null);
	useLayoutEffect(() => {
		if (!isOpen || !anchorRef.current) return;
		const rect = anchorRef.current.getBoundingClientRect();
		setCoords({
			top: rect.bottom + window.scrollY + 4,
			left: rect.left + window.scrollX + rect.width / 2
		});
	}, [isOpen, anchorRef]);
	useEffect(() => {
		if (!isOpen) return;
		function handleOutside(e) {
			if (ref.current && !ref.current.contains(e.target) && anchorRef.current && !anchorRef.current.contains(e.target)) onClose();
		}
		function handleEsc(e) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("mousedown", handleOutside);
		document.addEventListener("touchstart", handleOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleOutside);
			document.removeEventListener("touchstart", handleOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [
		isOpen,
		onClose,
		anchorRef
	]);
	if (!isOpen || !coords) return null;
	return createPortal(/* @__PURE__ */ jsxs("div", {
		ref,
		className: "slot-popover",
		role: "menu",
		style: {
			top: coords.top,
			left: coords.left
		},
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "slot-popover__option",
			role: "menuitem",
			onClick: () => {
				onSelectOnce();
				onClose();
			},
			children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				children: "📌"
			}), "Just once"]
		}), /* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "slot-popover__option",
			role: "menuitem",
			onClick: () => {
				onSelectRecurring();
				onClose();
			},
			children: [/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				children: "🔁"
			}), "Weekdays"]
		})]
	}), document.body);
}
//#endregion
//#region resources/js/features/weekly/hooks/useSwipeComplete.ts
var DEFAULT_THRESHOLD = 100;
var MAX_DRAG = 200;
function useSwipeComplete({ onComplete, onProgressChange, disabled = false, threshold = DEFAULT_THRESHOLD }) {
	const [dragX, setDragX] = useState(0);
	const [dragProgress, setDragProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isDone, setIsDone] = useState(false);
	const startX = useRef(0);
	const triggered = useRef(false);
	const elementRef = useRef(null);
	const onPointerMove = useCallback((e) => {
		const delta = Math.max(0, Math.min(e.clientX - startX.current, MAX_DRAG));
		const progress = delta / threshold;
		setDragX(delta);
		setDragProgress(progress);
		onProgressChange?.(progress);
		if (delta >= threshold && !triggered.current) {
			triggered.current = true;
			setIsDone(true);
			setDragX(0);
			setDragProgress(0);
			setIsDragging(false);
			onProgressChange?.(0);
			if (elementRef.current) elementRef.current.releasePointerCapture(e.pointerId);
			document.removeEventListener("pointermove", onPointerMove);
			document.removeEventListener("pointerup", onPointerUp);
			onComplete();
			setTimeout(() => setIsDone(false), 600);
		}
	}, [
		onComplete,
		onProgressChange,
		threshold
	]);
	const onPointerUp = useCallback(() => {
		setDragX(0);
		setDragProgress(0);
		setIsDragging(false);
		triggered.current = false;
		onProgressChange?.(0);
		document.removeEventListener("pointermove", onPointerMove);
		document.removeEventListener("pointerup", onPointerUp);
	}, [onPointerMove, onProgressChange]);
	return {
		dragX,
		dragProgress,
		isDragging,
		isDone,
		handlers: { onPointerDown: useCallback((e) => {
			if (disabled) return;
			startX.current = e.clientX;
			triggered.current = false;
			elementRef.current = e.currentTarget;
			e.currentTarget.setPointerCapture(e.pointerId);
			setIsDragging(true);
			document.addEventListener("pointermove", onPointerMove);
			document.addEventListener("pointerup", onPointerUp);
		}, [
			disabled,
			onPointerMove,
			onPointerUp
		]) }
	};
}
//#endregion
//#region resources/js/features/weekly/components/SlotMomentIcon.tsx
function SlotMomentIcon({ moment, date, onToggle, onSwipeProgress }) {
	const isCompleted = moment.status === "completed";
	const { dragX, isDragging, isDone, handlers } = useSwipeComplete({
		onComplete: () => onToggle(moment.id, moment.instance_id, date),
		onProgressChange: onSwipeProgress,
		threshold: moment.status === "completed" || moment.status === "missed" ? 180 : 100
	});
	const statusClass = moment.status ? `slot-icon--${moment.status}` : "slot-icon--future";
	const swipeClass = isDone ? "slot-icon--done" : isDragging || dragX > 0 ? "slot-icon--swiping" : "";
	return /* @__PURE__ */ jsxs("div", {
		className: "slot-icon-track",
		title: `${moment.name}${moment.status ? ` (${moment.status})` : ""} — swipe right to ${isCompleted ? "uncheck" : "complete"}`,
		children: [/* @__PURE__ */ jsx("span", {
			className: "slot-icon-track__check",
			"aria-hidden": true,
			children: "✓"
		}), /* @__PURE__ */ jsx("div", {
			className: `slot-icon ${statusClass} ${swipeClass}`.trim(),
			style: {
				transform: `translateX(${dragX}px)`,
				cursor: "grab"
			},
			...handlers,
			role: "button",
			tabIndex: 0,
			onKeyDown: (e) => {
				if (e.key === "Enter" || e.key === " ") onToggle(moment.id, moment.instance_id, date);
			},
			children: moment.icon ?? moment.name.charAt(0).toUpperCase()
		})]
	});
}
//#endregion
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
//#region resources/js/features/weekly/components/SlotMomentCard.tsx
function SlotMomentCard({ moment, date, isNext, onToggle, onSwipeProgress }) {
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
//#region resources/js/features/weekly/components/TimeSlotCell.tsx
function isOutOfOffice(time, config) {
	return time < config.office_start || time >= config.office_end;
}
function TimeSlotCell({ slot, date, config, onAddMoment, onToggleMoment, highlightTime, isWeekend, isToday, isNext }) {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [swipeProgress, setSwipeProgress] = useState(0);
	const [swipeDone, setSwipeDone] = useState(false);
	const addBtnRef = useRef(null);
	const ooo = !slot.moment && isOutOfOffice(slot.time, config);
	const isHighlighted = slot.time === highlightTime && !slot.moment && !isWeekend;
	const cls = [
		"weekly-slot",
		ooo ? "weekly-slot--ooo" : "",
		isWeekend ? "weekly-slot--weekend" : "",
		isToday ? "weekly-slot--today" : "",
		!slot.moment && !ooo ? "weekly-slot--empty" : "",
		slot.moment?.status === "completed" ? "weekly-slot--completed" : "",
		isHighlighted ? "weekly-slot--highlight" : "",
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
			style: { position: "relative" },
			children: slot.moment ? /* @__PURE__ */ jsx(SlotMomentCard, {
				moment: slot.moment,
				date,
				isNext,
				onToggle: handleToggle,
				onSwipeProgress: handleSwipeProgress
			}) : ooo ? /* @__PURE__ */ jsx("span", {
				className: "weekly-slot__ooo-dot",
				"aria-hidden": true
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
				ref: addBtnRef,
				type: "button",
				className: "weekly-slot__add-btn",
				title: `Add moment at ${slot.time}`,
				onClick: () => setPopoverOpen(true),
				children: "+"
			}), /* @__PURE__ */ jsx(AddSlotPopover, {
				isOpen: popoverOpen,
				anchorRef: addBtnRef,
				onClose: () => setPopoverOpen(false),
				onSelectOnce: () => onAddMoment(date, slot.time, "once"),
				onSelectRecurring: () => onAddMoment(date, slot.time, "recurring")
			})] })
		})]
	});
}
//#endregion
//#region resources/js/features/weekly/components/DaySection.tsx
var VISIBLE_SLOTS = 6;
/**
* Filter to on-the-hour slots only, then window to VISIBLE_SLOTS.
* Today: centred on the current hour. Other days: from wake time.
*/
function getWindowedSlots(slots, isToday) {
	const hourly = slots.filter((s) => s.time.endsWith(":00"));
	if (hourly.length <= VISIBLE_SLOTS) return hourly;
	if (!isToday) return hourly.slice(0, VISIBLE_SLOTS);
	const nowMins = (/* @__PURE__ */ new Date()).getHours() * 60 + (/* @__PURE__ */ new Date()).getMinutes();
	let nearestIdx = 0;
	let nearestDiff = Infinity;
	hourly.forEach((s, i) => {
		const [h] = s.time.split(":").map(Number);
		const diff = Math.abs(h * 60 - nowMins);
		if (diff < nearestDiff) {
			nearestDiff = diff;
			nearestIdx = i;
		}
	});
	const half = Math.floor(VISIBLE_SLOTS / 2);
	const start = Math.max(0, Math.min(nearestIdx - half, hourly.length - VISIBLE_SLOTS));
	return hourly.slice(start, start + VISIBLE_SLOTS);
}
function DaySection({ day, config, onAddMoment, onToggleMoment, highlightTime, nextMomentKey }) {
	const dateObj = parseISO(day.date);
	const visibleSlots = getWindowedSlots(day.slots, day.isToday);
	return /* @__PURE__ */ jsxs("section", {
		className: [
			"weekly-day-section",
			day.isToday ? "weekly-day-section--today" : "",
			day.isWeekend ? "weekly-day-section--weekend" : ""
		].filter(Boolean).join(" "),
		children: [/* @__PURE__ */ jsxs("header", {
			className: "weekly-day-header",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__name",
					children: day.dayName
				}),
				/* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__date",
					children: format(dateObj, "d MMM")
				}),
				day.isToday && /* @__PURE__ */ jsx("span", {
					className: "weekly-day-header__badge",
					children: "Today"
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-day-slots",
			children: visibleSlots.map((slot) => /* @__PURE__ */ jsx(TimeSlotCell, {
				slot,
				date: day.date,
				config,
				onAddMoment,
				onToggleMoment,
				highlightTime,
				isWeekend: day.isWeekend,
				isToday: day.isToday,
				isNext: !!slot.moment && nextMomentKey === `${day.date}:${slot.time}:${slot.moment.id}`
			}, `${day.date}-${slot.time}`))
		})]
	});
}
//#endregion
//#region resources/js/features/weekly/components/WeeklyGrid.tsx
/** Returns a stable key for the first pending/future moment across all days. */
function findNextMomentKey(days) {
	const now = /* @__PURE__ */ new Date();
	const todayStr = now.toISOString().slice(0, 10);
	const nowMins = now.getHours() * 60 + now.getMinutes();
	for (const day of days) {
		if (day.date < todayStr) continue;
		for (const slot of day.slots) {
			if (!slot.moment) continue;
			if (slot.moment.status === "completed" || slot.moment.status === "missed") continue;
			if (day.date === todayStr) {
				const [h, m] = slot.time.split(":").map(Number);
				if (h * 60 + m < nowMins) continue;
			}
			return `${day.date}:${slot.time}:${slot.moment.id}`;
		}
	}
	return null;
}
function WeeklyGrid({ days, config, onAddMoment, onToggleMoment, highlightTime }) {
	const nextMomentKey = findNextMomentKey(days);
	return /* @__PURE__ */ jsx("div", {
		className: "weekly-grid",
		children: days.map((day) => /* @__PURE__ */ jsx(DaySection, {
			day,
			config,
			onAddMoment,
			onToggleMoment,
			highlightTime,
			nextMomentKey
		}, day.date))
	});
}
//#endregion
//#region resources/js/features/weekly/components/WeekSelectorBar.tsx
function weekLabel(start) {
	const end = endOfISOWeek(start);
	return `${format(start, "d MMM")} – ${format(end, "d MMM")}`;
}
function WeekSelectorBar({ weekStart }) {
	const current = startOfISOWeek(parseISO(weekStart));
	const prev = subWeeks(current, 1);
	const next = addWeeks(current, 1);
	function navigate(date) {
		router.get(route("weekly"), { week: format(date, "yyyy-MM-dd") }, { preserveScroll: false });
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "week-selector",
		children: [
			/* @__PURE__ */ jsx("button", {
				className: "week-selector__btn week-selector__btn--prev",
				onClick: () => navigate(prev),
				"aria-label": "Previous week",
				children: /* @__PURE__ */ jsx("span", {
					className: "week-selector__btn-range",
					children: weekLabel(prev)
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "week-selector__current",
				children: /* @__PURE__ */ jsx("span", {
					className: "week-selector__current-range",
					children: weekLabel(current)
				})
			}),
			/* @__PURE__ */ jsx("button", {
				className: "week-selector__btn week-selector__btn--next",
				onClick: () => navigate(next),
				"aria-label": "Next week",
				children: /* @__PURE__ */ jsx("span", {
					className: "week-selector__btn-range",
					children: weekLabel(next)
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Weekly/Index.tsx
function Index({ weekStart, weekEnd, config, days }) {
	const [showingModal, setShowingModal] = useState(false);
	const [highlightTime, setHighlightTime] = useState(null);
	const [modalDefaults, setModalDefaults] = useState();
	function handleAddMoment(date, time, mode) {
		if (mode === "recurring") {
			setHighlightTime(time);
			setModalDefaults({
				frequency: "weekly",
				days_of_week: [
					1,
					2,
					3,
					4,
					5
				],
				preferred_time: time
			});
		} else setModalDefaults({
			frequency: "custom",
			days_of_week: [new Date(date).getDay() || 7],
			preferred_time: time
		});
		setShowingModal(true);
	}
	function handleModalClose() {
		setShowingModal(false);
		setHighlightTime(null);
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
	async function handleToggleMoment(momentId, _instanceId, date) {
		const token = document.querySelector("meta[name=\"csrf-token\"]")?.content ?? "";
		await fetch(route("moments.toggle", { moment: momentId }), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-TOKEN": token,
				"Accept": "application/json"
			},
			body: JSON.stringify({ date })
		});
		router.reload({ only: ["days"] });
	}
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx(WeekSelectorBar, { weekStart }),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Weekly" }),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(WeeklyGrid, {
						days,
						config,
						onAddMoment: handleAddMoment,
						onToggleMoment: handleToggleMoment,
						highlightTime: highlightTime ?? void 0
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
