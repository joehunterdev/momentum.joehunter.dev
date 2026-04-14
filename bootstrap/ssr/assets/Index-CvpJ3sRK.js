import { t as Authenticated } from "./AuthenticatedLayout-Boxls7xi.js";
import { t as DateSelectorBar } from "./calendar-DnbwfYs_.js";
import { t as MomentModal } from "./moments-DKp5PxC1.js";
import { Head, router } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
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
//#region resources/js/features/weekly/components/SlotMomentCard.tsx
var STATUS_DOT = {
	completed: "slot-moment-card__status--completed",
	missed: "slot-moment-card__status--missed",
	pending: "slot-moment-card__status--pending"
};
function SlotMomentCard({ moment }) {
	return /* @__PURE__ */ jsx("div", {
		className: "slot-moment-card",
		children: /* @__PURE__ */ jsxs("div", {
			className: "slot-moment-card__row",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: ["slot-moment-card__status", moment.status ? STATUS_DOT[moment.status] ?? "" : "slot-moment-card__status--future"].join(" "),
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "slot-moment-card__body",
					children: [/* @__PURE__ */ jsx("span", {
						className: "slot-moment-card__name",
						children: moment.name
					}), moment.description && /* @__PURE__ */ jsx("span", {
						className: "slot-moment-card__desc",
						children: moment.description
					})]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "slot-moment-card__edit-btn",
					title: `Edit ${moment.name}`,
					onClick: () => router.get(route("moments.edit", { moment: moment.id })),
					"aria-label": `Edit ${moment.name}`,
					children: "✏️"
				})
			]
		})
	});
}
//#endregion
//#region resources/js/features/weekly/components/TimeSlotCell.tsx
function isOutOfOffice(time, config) {
	return time < config.office_start || time >= config.office_end;
}
function TimeSlotCell({ slot, date, config, onAddMoment, isWeekend, isToday }) {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const addBtnRef = useRef(null);
	const ooo = isOutOfOffice(slot.time, config);
	return /* @__PURE__ */ jsxs("div", {
		className: [
			"weekly-slot",
			ooo && !slot.moment ? "weekly-slot--ooo" : "",
			isWeekend ? "weekly-slot--weekend" : "",
			isToday ? "weekly-slot--today" : "",
			!slot.moment && !ooo ? "weekly-slot--empty" : ""
		].filter(Boolean).join(" "),
		children: [/* @__PURE__ */ jsx("span", {
			className: "weekly-slot__time",
			children: slot.time
		}), /* @__PURE__ */ jsx("div", {
			className: "weekly-slot__content",
			style: { position: "relative" },
			children: slot.moment ? /* @__PURE__ */ jsx(SlotMomentCard, { moment: slot.moment }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
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
var VISIBLE_SLOTS$1 = 6;
function getWindowedSlots(slots, windowStart) {
	return slots.filter((s) => s.time.endsWith(":00")).slice(windowStart, windowStart + VISIBLE_SLOTS$1);
}
function DaySection({ day, config, onAddMoment, windowStart }) {
	const dateObj = parseISO(day.date);
	const visibleSlots = getWindowedSlots(day.slots, windowStart);
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
				isWeekend: day.isWeekend,
				isToday: day.isToday
			}, `${day.date}-${slot.time}`))
		})]
	});
}
//#endregion
//#region resources/js/features/weekly/components/WeeklyGrid.tsx
var VISIBLE_SLOTS = 6;
/** Returns the start index into the hourly slot array so all days show the same time window. */
function computeWindowStart(days) {
	const allTimes = Array.from(new Set(days.flatMap((d) => d.slots.map((s) => s.time).filter((t) => t.endsWith(":00"))))).sort();
	if (allTimes.length <= VISIBLE_SLOTS) return 0;
	const nowHour = (/* @__PURE__ */ new Date()).getHours();
	const nowTime = `${String(nowHour).padStart(2, "0")}:00`;
	let anchorIdx = allTimes.findIndex((t) => t >= nowTime);
	if (anchorIdx < 0) anchorIdx = allTimes.length - 1;
	const half = Math.floor(VISIBLE_SLOTS / 2);
	return Math.max(0, Math.min(anchorIdx - half, allTimes.length - VISIBLE_SLOTS));
}
function WeeklyGrid({ days, config, onAddMoment }) {
	const windowStart = computeWindowStart(days);
	return /* @__PURE__ */ jsx("div", {
		className: "weekly-grid",
		children: days.map((day) => /* @__PURE__ */ jsx(DaySection, {
			day,
			config,
			onAddMoment,
			windowStart
		}, day.date))
	});
}
//#endregion
//#region resources/js/Pages/Weekly/Index.tsx
function Index({ weekStart, config, days }) {
	const [showingModal, setShowingModal] = useState(false);
	const [modalDefaults, setModalDefaults] = useState();
	function handleAddMoment(date, time, mode) {
		if (mode === "recurring") setModalDefaults({
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
		else setModalDefaults({
			frequency: "custom",
			days_of_week: [new Date(date).getDay() || 7],
			preferred_time: time
		});
		setShowingModal(true);
	}
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
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx(DateSelectorBar, {
			mode: "week",
			weekStart
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Weekly" }),
			/* @__PURE__ */ jsx("div", {
				className: "py-0 sm:py-6",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsx(WeeklyGrid, {
						days,
						config,
						onAddMoment: handleAddMoment
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
