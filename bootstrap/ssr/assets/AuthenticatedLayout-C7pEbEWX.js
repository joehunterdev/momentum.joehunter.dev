import { t as ApplicationLogo } from "./ApplicationLogo-DoHiahSs.js";
import { Link, router, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Transition } from "@headlessui/react";
import { createPortal } from "react-dom";
//#region resources/js/Components/Dropdown.tsx
var DropDownContext = createContext({
	open: false,
	setOpen: () => {},
	toggleOpen: () => {}
});
var Dropdown = ({ children }) => {
	const [open, setOpen] = useState(false);
	const toggleOpen = () => {
		setOpen((previousState) => !previousState);
	};
	return /* @__PURE__ */ jsx(DropDownContext.Provider, {
		value: {
			open,
			setOpen,
			toggleOpen
		},
		children: /* @__PURE__ */ jsx("div", {
			className: "relative",
			children
		})
	});
};
var Trigger = ({ children }) => {
	const { open, setOpen, toggleOpen } = useContext(DropDownContext);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		onClick: toggleOpen,
		children
	}), open && /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-40",
		onClick: () => setOpen(false)
	})] });
};
var Content = ({ align = "right", width = "48", contentClasses = "py-1 bg-white", children }) => {
	const { open, setOpen } = useContext(DropDownContext);
	let alignmentClasses = "origin-top";
	if (align === "left") alignmentClasses = "ltr:origin-top-left rtl:origin-top-right start-0";
	else if (align === "right") alignmentClasses = "ltr:origin-top-right rtl:origin-top-left end-0";
	let widthClasses = "";
	if (width === "48") widthClasses = "w-48";
	return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Transition, {
		show: open,
		enter: "transition ease-out duration-200",
		enterFrom: "opacity-0 scale-95",
		enterTo: "opacity-100 scale-100",
		leave: "transition ease-in duration-75",
		leaveFrom: "opacity-100 scale-100",
		leaveTo: "opacity-0 scale-95",
		children: /* @__PURE__ */ jsx("div", {
			className: `absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`,
			onClick: () => setOpen(false),
			children: /* @__PURE__ */ jsx("div", {
				className: `rounded-md ring-1 ring-black ring-opacity-5 ` + contentClasses,
				children
			})
		})
	}) });
};
var DropdownLink = ({ className = "", children, ...props }) => {
	return /* @__PURE__ */ jsx(Link, {
		...props,
		className: "block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none " + className,
		children
	});
};
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
//#endregion
//#region resources/js/Components/NavLink.tsx
function NavLink({ active = false, className = "", children, ...props }) {
	return /* @__PURE__ */ jsx(Link, {
		...props,
		className: "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none " + (active ? "border-indigo-400 text-gray-900 focus:border-indigo-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700") + className,
		children
	});
}
//#endregion
//#region resources/js/Components/ResponsiveNavLink.tsx
function ResponsiveNavLink({ active = false, className = "", children, ...props }) {
	return /* @__PURE__ */ jsx(Link, {
		...props,
		className: `flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${active ? "border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800" : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800"} text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`,
		children
	});
}
//#endregion
//#region resources/js/shared/components/calendar/CalendarNav.tsx
/**
* Generic prev/current/next navigation bar for daily, weekly, and monthly views.
* Pages compute labels and params — this component is intentionally dumb.
*/
function CalendarNav({ prevLabel, currentLabel, nextLabel, prevParam, nextParam, routeName }) {
	function navigate(params) {
		router.get(route(routeName), params, { preserveScroll: false });
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "calendar-nav",
		children: [
			/* @__PURE__ */ jsx("button", {
				className: "calendar-nav__btn calendar-nav__btn--prev",
				onClick: () => navigate(prevParam),
				"aria-label": `Go to ${prevLabel}`,
				children: /* @__PURE__ */ jsx("span", {
					className: "calendar-nav__label",
					children: prevLabel
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "calendar-nav__current",
				children: /* @__PURE__ */ jsx("span", {
					className: "calendar-nav__current-label",
					children: currentLabel
				})
			}),
			/* @__PURE__ */ jsx("button", {
				className: "calendar-nav__btn calendar-nav__btn--next",
				onClick: () => navigate(nextParam),
				"aria-label": `Go to ${nextLabel}`,
				children: /* @__PURE__ */ jsx("span", {
					className: "calendar-nav__label",
					children: nextLabel
				})
			})
		]
	});
}
//#endregion
//#region resources/js/features/calendar/hooks/useSwipeComplete.ts
var BASE_THRESHOLD = 80;
var MAX_THRESHOLD = 240;
var MAX_DRAG = 300;
var MAX_HOLD_MS = 700;
/**
* Ease-out: fast start, decelerates toward threshold.
* Higher resistanceFactor = heavier deceleration curve.
*/
function applyEasing(raw, threshold, resistanceFactor) {
	const t = Math.min(raw / threshold, 1);
	const exponent = 1 + resistanceFactor * 2;
	return threshold * (1 - Math.pow(1 - t, exponent)) + Math.max(0, raw - threshold) * .15;
}
/** RAF-based spring snap-back. Returns a cancel fn. */
function springDecay(startVal, setter) {
	let current = startVal;
	let rafId = 0;
	const step = () => {
		current *= .65;
		if (Math.abs(current) < .5) {
			setter(0);
			return;
		}
		setter(current);
		rafId = requestAnimationFrame(step);
	};
	rafId = requestAnimationFrame(step);
	return () => cancelAnimationFrame(rafId);
}
function vibrate(pattern) {
	try {
		navigator.vibrate?.(pattern);
	} catch {}
}
function useSwipeComplete({ onComplete, onProgressChange, disabled = false, resistanceFactor = 0 }) {
	const threshold = BASE_THRESHOLD + resistanceFactor * (MAX_THRESHOLD - BASE_THRESHOLD);
	const holdDuration = resistanceFactor * MAX_HOLD_MS;
	const [dragX, setDragX] = useState(0);
	const [dragProgress, setDragProgress] = useState(0);
	const [holdProgress, setHoldProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isDone, setIsDone] = useState(false);
	const startX = useRef(0);
	const triggered = useRef(false);
	const halfPulsed = useRef(false);
	const inHoldZone = useRef(false);
	const holdRafId = useRef(0);
	const holdStartTime = useRef(0);
	const currentEased = useRef(0);
	const cancelDecay = useRef(null);
	const capturedElement = useRef(null);
	const capturedPointerId = useRef(-1);
	const stopHold = useCallback(() => {
		cancelAnimationFrame(holdRafId.current);
		inHoldZone.current = false;
		holdStartTime.current = 0;
		setHoldProgress(0);
	}, []);
	const triggerComplete = useCallback(() => {
		if (triggered.current) return;
		triggered.current = true;
		vibrate([
			30,
			10,
			30
		]);
		capturedElement.current?.releasePointerCapture(capturedPointerId.current);
		capturedElement.current = null;
		setIsDone(true);
		setDragX(0);
		setDragProgress(0);
		setHoldProgress(0);
		setIsDragging(false);
		inHoldZone.current = false;
		onProgressChange?.(0);
		onComplete();
		setTimeout(() => setIsDone(false), 600);
	}, [onComplete, onProgressChange]);
	return {
		dragX,
		dragProgress,
		holdProgress,
		isDragging,
		isDone,
		handlers: {
			onPointerDown: useCallback((e) => {
				if (disabled) return;
				e.preventDefault();
				cancelDecay.current?.();
				cancelDecay.current = null;
				const el = e.currentTarget;
				el.setPointerCapture(e.pointerId);
				capturedElement.current = el;
				capturedPointerId.current = e.pointerId;
				startX.current = e.clientX;
				triggered.current = false;
				halfPulsed.current = false;
				inHoldZone.current = false;
				currentEased.current = 0;
				setIsDragging(true);
				setDragX(0);
				setDragProgress(0);
				setHoldProgress(0);
			}, [disabled]),
			onPointerMove: useCallback((e) => {
				if (triggered.current) return;
				if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
				const rawDelta = Math.max(0, Math.min(e.clientX - startX.current, MAX_DRAG));
				const eased = applyEasing(rawDelta, threshold, resistanceFactor);
				const progress = Math.min(rawDelta / threshold, 1);
				currentEased.current = eased;
				setDragX(eased);
				setDragProgress(progress);
				onProgressChange?.(progress);
				if (progress >= .5 && !halfPulsed.current) {
					halfPulsed.current = true;
					vibrate(10);
				}
				const atThreshold = rawDelta >= threshold;
				if (atThreshold && !inHoldZone.current) {
					inHoldZone.current = true;
					holdStartTime.current = performance.now();
					if (holdDuration <= 0) {
						triggerComplete();
						return;
					}
					const tick = () => {
						if (!inHoldZone.current) return;
						const hp = Math.min((performance.now() - holdStartTime.current) / holdDuration, 1);
						setHoldProgress(hp);
						if (hp >= 1) triggerComplete();
						else holdRafId.current = requestAnimationFrame(tick);
					};
					holdRafId.current = requestAnimationFrame(tick);
				} else if (!atThreshold && inHoldZone.current) stopHold();
			}, [
				threshold,
				resistanceFactor,
				holdDuration,
				onProgressChange,
				triggerComplete,
				stopHold
			]),
			onPointerUp: useCallback((e) => {
				if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
				e.currentTarget.releasePointerCapture(e.pointerId);
				capturedElement.current = null;
				stopHold();
				setIsDragging(false);
				setDragProgress(0);
				setHoldProgress(0);
				onProgressChange?.(0);
				triggered.current = false;
				halfPulsed.current = false;
				cancelDecay.current = springDecay(currentEased.current, setDragX);
			}, [stopHold, onProgressChange]),
			onPointerCancel: useCallback((_e) => {
				stopHold();
				cancelDecay.current?.();
				capturedElement.current = null;
				setIsDragging(false);
				setDragX(0);
				setDragProgress(0);
				setHoldProgress(0);
				triggered.current = false;
			}, [stopHold])
		}
	};
}
//#endregion
//#region resources/js/shared/types/enums.ts
/**
* Shared TypeScript enums used across the application.
* These mirror backend enum structures where applicable.
*/
/**
* Status of a moment instance or slot.
* Mirrors backend MomentInstance status values.
*/
var MomentStatus = /* @__PURE__ */ function(MomentStatus) {
	MomentStatus["Pending"] = "pending";
	MomentStatus["Completed"] = "completed";
	MomentStatus["Missed"] = "missed";
	MomentStatus["Skipped"] = "skipped";
	return MomentStatus;
}({});
/**
* Type of moment scheduling.
* Used in scheduling flow to determine if moment is one-time or recurring.
*/
var SchedulingKind = /* @__PURE__ */ function(SchedulingKind) {
	SchedulingKind["OneOff"] = "one-off";
	SchedulingKind["Recurring"] = "recurring";
	return SchedulingKind;
}({});
//#endregion
//#region resources/js/shared/components/calendar/MomentIcon.tsx
function MomentIcon({ moment, date, onToggle, onSwipeProgress, isStatic = false }) {
	const isPast = moment.status === MomentStatus.Completed || moment.status === MomentStatus.Missed;
	const resistanceFactor = moment.consistency !== null ? Math.max(0, Math.min(1, 1 - moment.consistency / 100)) : 1;
	const { dragX, dragProgress: _dragProgress, holdProgress, isDragging, isDone, handlers } = useSwipeComplete({
		onComplete: () => onToggle(moment.id, moment.instance_id, date),
		onProgressChange: onSwipeProgress,
		resistanceFactor: isPast ? .5 : resistanceFactor,
		disabled: isStatic
	});
	const statusClass = moment.status ? `slot-icon--${moment.status}` : "slot-icon--future";
	const swipeClass = !isStatic && (isDone ? "slot-icon--done" : holdProgress > 0 ? "slot-icon--holding" : isDragging || dragX > 0 ? "slot-icon--swiping" : "");
	return /* @__PURE__ */ jsxs("div", {
		className: "slot-icon-track",
		title: `${moment.name ?? "Untitled Moment"}${moment.status ? ` (${moment.status})` : ""}`,
		children: [!isStatic && /* @__PURE__ */ jsx("span", {
			className: "slot-icon-track__check",
			"aria-hidden": true,
			children: "✓"
		}), /* @__PURE__ */ jsx("div", {
			className: [
				"slot-icon",
				statusClass,
				swipeClass
			].filter(Boolean).join(" "),
			style: isStatic ? void 0 : {
				transform: `translateX(${dragX}px)`,
				cursor: isDragging ? "grabbing" : "grab",
				["--hold-progress"]: holdProgress
			},
			...!isStatic ? handlers : {},
			role: isStatic ? void 0 : "button",
			tabIndex: isStatic ? void 0 : 0,
			onKeyDown: isStatic ? void 0 : (e) => {
				if (e.key === "Enter" || e.key === " ") onToggle(moment.id, moment.instance_id, date);
			},
			children: moment.icon ? moment.icon : /* @__PURE__ */ jsx("img", {
				src: "/logo.png",
				alt: "",
				className: "slot-icon__default-logo"
			})
		})]
	});
}
//#endregion
//#region resources/js/shared/constants/icons.ts
var MOMENT_ICONS = [
	{
		name: "Water",
		emoji: "💧",
		category: "health"
	},
	{
		name: "Apple",
		emoji: "🍎",
		category: "health"
	},
	{
		name: "Salad",
		emoji: "🥗",
		category: "health"
	},
	{
		name: "Vitamin",
		emoji: "💊",
		category: "health"
	},
	{
		name: "Sleep",
		emoji: "😴",
		category: "health"
	},
	{
		name: "Tooth",
		emoji: "🦷",
		category: "health"
	},
	{
		name: "Heart",
		emoji: "❤️",
		category: "health"
	},
	{
		name: "Medicine",
		emoji: "🩺",
		category: "health"
	},
	{
		name: "Run",
		emoji: "🏃",
		category: "fitness"
	},
	{
		name: "Gym",
		emoji: "🏋️",
		category: "fitness"
	},
	{
		name: "Yoga",
		emoji: "🧘",
		category: "fitness"
	},
	{
		name: "Cycle",
		emoji: "🚴",
		category: "fitness"
	},
	{
		name: "Swim",
		emoji: "🏊",
		category: "fitness"
	},
	{
		name: "Walk",
		emoji: "🚶",
		category: "fitness"
	},
	{
		name: "Stretch",
		emoji: "🤸",
		category: "fitness"
	},
	{
		name: "Hike",
		emoji: "🥾",
		category: "fitness"
	},
	{
		name: "Meditate",
		emoji: "🧘",
		category: "mind"
	},
	{
		name: "Read",
		emoji: "📚",
		category: "mind"
	},
	{
		name: "Journal",
		emoji: "📝",
		category: "mind"
	},
	{
		name: "Brain",
		emoji: "🧠",
		category: "mind"
	},
	{
		name: "Pray",
		emoji: "🙏",
		category: "mind"
	},
	{
		name: "Breathe",
		emoji: "🌬️",
		category: "mind"
	},
	{
		name: "Gratitude",
		emoji: "🌸",
		category: "mind"
	},
	{
		name: "Learn",
		emoji: "🎓",
		category: "mind"
	},
	{
		name: "Code",
		emoji: "💻",
		category: "work"
	},
	{
		name: "Email",
		emoji: "📧",
		category: "work"
	},
	{
		name: "Meeting",
		emoji: "🤝",
		category: "work"
	},
	{
		name: "Study",
		emoji: "📖",
		category: "work"
	},
	{
		name: "Write",
		emoji: "✍️",
		category: "work"
	},
	{
		name: "Plan",
		emoji: "📋",
		category: "work"
	},
	{
		name: "Focus",
		emoji: "🎯",
		category: "work"
	},
	{
		name: "Review",
		emoji: "🔍",
		category: "work"
	},
	{
		name: "Call",
		emoji: "📞",
		category: "social"
	},
	{
		name: "Family",
		emoji: "👨‍👩‍👧",
		category: "social"
	},
	{
		name: "Friends",
		emoji: "👥",
		category: "social"
	},
	{
		name: "Message",
		emoji: "💬",
		category: "social"
	},
	{
		name: "Date",
		emoji: "💑",
		category: "social"
	},
	{
		name: "Volunteer",
		emoji: "🫶",
		category: "social"
	},
	{
		name: "Music",
		emoji: "🎵",
		category: "creative"
	},
	{
		name: "Art",
		emoji: "🎨",
		category: "creative"
	},
	{
		name: "Camera",
		emoji: "📷",
		category: "creative"
	},
	{
		name: "Guitar",
		emoji: "🎸",
		category: "creative"
	},
	{
		name: "Dance",
		emoji: "💃",
		category: "creative"
	},
	{
		name: "Craft",
		emoji: "🧵",
		category: "creative"
	},
	{
		name: "Star",
		emoji: "⭐",
		category: "general"
	},
	{
		name: "Fire",
		emoji: "🔥",
		category: "general"
	},
	{
		name: "Check",
		emoji: "✅",
		category: "general"
	},
	{
		name: "Clock",
		emoji: "⏰",
		category: "general"
	},
	{
		name: "Money",
		emoji: "💰",
		category: "general"
	},
	{
		name: "Clean",
		emoji: "🧹",
		category: "general"
	},
	{
		name: "Cook",
		emoji: "🍳",
		category: "general"
	},
	{
		name: "Plant",
		emoji: "🌱",
		category: "general"
	},
	{
		name: "Sun",
		emoji: "☀️",
		category: "general"
	},
	{
		name: "Moon",
		emoji: "🌙",
		category: "general"
	}
];
var ICON_CATEGORIES = [
	"all",
	"health",
	"fitness",
	"mind",
	"work",
	"social",
	"creative",
	"general"
];
//#endregion
//#region resources/js/shared/components/calendar/CalendarMomentCard.tsx
function CalendarMomentCard({ moment, variant = "edit", onDraftNameChange, onDraftIconChange }) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const [pickerStyle, setPickerStyle] = useState({});
	const iconBtnRef = useRef(null);
	useEffect(() => {
		if (!pickerOpen || !iconBtnRef.current) return;
		const rect = iconBtnRef.current.getBoundingClientRect();
		const pickerWidth = 224;
		const top = window.innerHeight - rect.bottom >= 260 ? rect.bottom + 6 : rect.top - 266;
		let left = rect.left;
		if (left + pickerWidth > window.innerWidth - 8) left = window.innerWidth - pickerWidth - 8;
		setPickerStyle({
			position: "fixed",
			top,
			left,
			width: pickerWidth,
			zIndex: 9999
		});
	}, [pickerOpen]);
	useEffect(() => {
		if (!pickerOpen) return;
		const close = (e) => {
			if (iconBtnRef.current && !iconBtnRef.current.contains(e.target)) setPickerOpen(false);
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [pickerOpen]);
	const cardCls = ["moment-card", variant === "draft" ? "moment-card--draft" : ""].filter(Boolean).join(" ");
	if (variant === "draft") return /* @__PURE__ */ jsx("div", {
		className: "moment-card moment-card--draft-edit",
		children: /* @__PURE__ */ jsxs("div", {
			className: "moment-card__row",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "draft-icon-wrap",
				children: [/* @__PURE__ */ jsx("button", {
					ref: iconBtnRef,
					type: "button",
					className: "slot-icon slot-icon--future slot-icon--draft-placeholder draft-icon-trigger",
					title: "Pick an icon",
					onClick: (e) => {
						e.stopPropagation();
						setPickerOpen((v) => !v);
					},
					children: moment.icon ?? "📈"
				}), pickerOpen && createPortal(/* @__PURE__ */ jsx("div", {
					className: "draft-icon-picker",
					style: pickerStyle,
					role: "dialog",
					"aria-label": "Pick an icon",
					children: /* @__PURE__ */ jsx("div", {
						className: "draft-icon-picker__grid",
						children: MOMENT_ICONS.map((opt) => /* @__PURE__ */ jsx("button", {
							type: "button",
							className: ["draft-icon-picker__item", moment.icon === opt.emoji ? "draft-icon-picker__item--active" : ""].filter(Boolean).join(" "),
							title: opt.name,
							onClick: () => {
								onDraftIconChange?.(opt.emoji);
								setPickerOpen(false);
							},
							children: opt.emoji
						}, opt.name))
					})
				}), document.body)]
			}), /* @__PURE__ */ jsx("div", {
				className: "moment-card__body",
				children: /* @__PURE__ */ jsx("input", {
					type: "text",
					className: "draft-name-input",
					placeholder: "Name this moment…",
					value: moment.name === "New Moment" ? "" : moment.name ?? "",
					maxLength: 60,
					onChange: (e) => onDraftNameChange?.(e.target.value)
				})
			})]
		})
	});
	const name = moment.name ?? "Untitled Moment";
	return /* @__PURE__ */ jsx("div", {
		className: cardCls,
		children: /* @__PURE__ */ jsxs("div", {
			className: "moment-card__row",
			children: [
				/* @__PURE__ */ jsx(MomentIcon, {
					moment,
					date: "",
					onToggle: () => {},
					isStatic: true
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "moment-card__body",
					children: [/* @__PURE__ */ jsx("span", {
						className: "moment-card__name",
						children: name
					}), moment.description && /* @__PURE__ */ jsx("span", {
						className: "moment-card__desc",
						children: moment.description
					})]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "moment-card__edit-btn",
					title: `Edit ${name}`,
					onClick: () => router.get(route("moments.edit", { moment: moment.id })),
					"aria-label": `Edit ${name}`,
					children: "✏️"
				})
			]
		})
	});
}
//#endregion
//#region resources/js/shared/components/calendar/CalendarProgressBar.tsx
/**
* Horizontal fill bar showing X / Y moments done.
* Used in the calendar header for daily, weekly, and monthly views.
*/
function CalendarProgressBar({ completedCount, totalCount }) {
	const pct = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "calendar-progress",
		title: `${completedCount} of ${totalCount} done`,
		children: [/* @__PURE__ */ jsx("div", {
			className: "calendar-progress__bar",
			children: /* @__PURE__ */ jsx("div", {
				className: "calendar-progress__fill",
				style: { width: `${pct}%` }
			})
		}), /* @__PURE__ */ jsxs("span", {
			className: "calendar-progress__label",
			children: [
				completedCount,
				" / ",
				totalCount
			]
		})]
	});
}
//#endregion
//#region resources/js/shared/components/calendar/CalendarSection.tsx
function CalendarSection({ isToday = false, isWeekend = false, layout = "vertical", header, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: [
			"calendar-section",
			isToday ? "calendar-section--today" : "",
			isWeekend ? "calendar-section--weekend" : ""
		].filter(Boolean).join(" "),
		children: [header, /* @__PURE__ */ jsx("div", {
			className: ["calendar-section__articles", layout === "horizontal" ? "calendar-section__articles--horizontal" : ""].filter(Boolean).join(" "),
			children
		})]
	});
}
//#endregion
//#region resources/js/shared/components/calendar/utils.ts
/**
* Filter time slots to those visible in the wake→sleep window.
* For today, anchors to (now - 2h) snapped to interval to keep current time in view.
*
* @param slots - all time slots for the day
* @param config - calendar configuration with wake/sleep times
* @param isToday - whether this is today's view
* @param intervalMinutes - slot interval for snapping (default: 30)
* @returns filtered array of visible time slots
*/
function getVisibleTimeSlots(slots, config, isToday, intervalMinutes = 30) {
	const inWindow = slots.filter((s) => s.time >= config.wake_time && s.time < config.sleep_time);
	if (!isToday) return inWindow;
	const now = /* @__PURE__ */ new Date();
	const cutoffMinutes = Math.max(0, now.getHours() * 60 + now.getMinutes() - 120);
	const snappedCutoff = cutoffMinutes - cutoffMinutes % intervalMinutes;
	const cutoffTime = `${String(Math.floor(snappedCutoff / 60)).padStart(2, "0")}:${String(snappedCutoff % 60).padStart(2, "0")}`;
	return inWindow.filter((s) => s.time >= cutoffTime || s.moment !== null);
}
/**
* Check if a time falls outside office hours.
*/
function isOutOfOffice(time, config) {
	return time < config.office_start || time >= config.office_end;
}
/**
* JS getDay() (0=Sun) to ISO weekday (1=Mon, 7=Sun).
*/
function jsToIsoDay(d) {
	return d === 0 ? 7 : d;
}
/**
* Compute the start index into a sorted hourly time array to center on current time.
* Used by weekly view to show the current hour in the middle of the visible window.
*
* @param allTimes - sorted array of unique times (e.g., ["07:00", "08:00", ...])
* @param visibleCount - number of slots to show (e.g., 6)
* @returns start index to slice into allTimes
*/
function computeWindowStart(allTimes, visibleCount) {
	if (allTimes.length <= visibleCount) return 0;
	const nowHour = (/* @__PURE__ */ new Date()).getHours();
	const nowTime = `${String(nowHour).padStart(2, "0")}:00`;
	let anchorIdx = allTimes.findIndex((t) => t >= nowTime);
	if (anchorIdx < 0) anchorIdx = allTimes.length - 1;
	const half = Math.floor(visibleCount / 2);
	return Math.max(0, Math.min(anchorIdx - half, allTimes.length - visibleCount));
}
//#endregion
//#region resources/js/shared/components/calendar/MomentDisplay.tsx
function MomentDisplay({ moment, progress }) {
	const pct = Math.max(0, Math.min(100, progress ?? moment.progress ?? 0));
	const name = moment.name ?? "Untitled Moment";
	return /* @__PURE__ */ jsxs("div", {
		className: "moment-action-item",
		style: { "--moment-progress": `${pct}%` },
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "moment-action-item__progress-bg",
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("span", {
				className: "moment-action-item__icon",
				children: moment.icon ?? "📌"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "moment-action-item__body",
				children: [/* @__PURE__ */ jsx("span", {
					className: "moment-action-item__title",
					children: name
				}), moment.description && /* @__PURE__ */ jsx("span", {
					className: "moment-action-item__description",
					children: moment.description
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/shared/components/calendar/CalendarSectionArticle.tsx
function articleTargetsScheduling(scheduling, date, time, isoDayNumber) {
	if (!scheduling) return false;
	if (time !== void 0 && scheduling.time !== null && scheduling.time !== time) return false;
	if (scheduling.kind === "one-off") {
		if (date !== void 0 && scheduling.date !== date) return false;
		return date !== void 0;
	}
	if (isoDayNumber !== void 0) return scheduling.daysOfWeek.includes(isoDayNumber);
	if (date !== void 0) {
		const iso = jsToIsoDay(new Date(date).getDay());
		return scheduling.daysOfWeek.includes(iso);
	}
	return false;
}
function makeDraftMoment(scheduling) {
	return {
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
		environment_prompt: null,
		progress: null
	};
}
function CalendarSectionArticle({ date, time, isoDayNumber, moment, config, capabilities, mode, scheduling, onStartScheduling, onDraftNameChange, onDraftIconChange, isToday, isWeekend }) {
	const targets = articleTargetsScheduling(scheduling, date, time, isoDayNumber);
	const isDraft = !!capabilities.draftEdit && targets && !moment;
	const isConflict = !!capabilities.conflictBadge && targets && !!moment;
	const ooo = capabilities.outOfOffice && time && config && !moment ? isOutOfOffice(time, config) : false;
	const cls = [
		"calendar-article",
		"weekly-slot",
		isToday && "calendar-article--today weekly-slot--today",
		isWeekend && "calendar-article--weekend weekly-slot--weekend",
		ooo && "calendar-article--ooo weekly-slot--ooo",
		!moment && !ooo && mode === "configure" && "calendar-article--empty weekly-slot--empty",
		moment?.status === "completed" && "calendar-article--completed weekly-slot--completed",
		isConflict && "calendar-article--conflict weekly-slot--conflict",
		time === void 0 && "weekly-slot--no-time"
	].filter(Boolean).join(" ");
	const emptyClickable = capabilities.addOnEmpty && !moment && !isDraft && !ooo;
	return /* @__PURE__ */ jsxs("div", {
		className: cls,
		children: [time !== void 0 && /* @__PURE__ */ jsx("span", {
			className: `calendar-article__time weekly-slot__time${emptyClickable ? " calendar-article__time--clickable weekly-slot__time--clickable" : ""}`,
			onClick: emptyClickable ? onStartScheduling : void 0,
			title: emptyClickable ? `Add moment at ${time}` : void 0,
			children: time
		}), /* @__PURE__ */ jsx("div", {
			className: "calendar-article__content weekly-slot__content",
			style: { position: "relative" },
			children: isDraft ? /* @__PURE__ */ jsx(CalendarMomentCard, {
				moment: makeDraftMoment(scheduling),
				variant: "draft",
				onDraftNameChange,
				onDraftIconChange
			}) : moment ? /* @__PURE__ */ jsxs(Fragment, { children: [mode === "configure" ? /* @__PURE__ */ jsx(CalendarMomentCard, {
				moment,
				variant: "edit"
			}) : /* @__PURE__ */ jsx(MomentDisplay, { moment }), isConflict && /* @__PURE__ */ jsx("span", {
				className: "calendar-article__conflict-badge weekly-slot__conflict-badge",
				title: "Scheduling conflict",
				children: "⚠️"
			})] }) : ooo ? /* @__PURE__ */ jsx("span", {
				className: "calendar-article__ooo-dot weekly-slot__ooo-dot",
				"aria-hidden": true
			}) : emptyClickable ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "calendar-article__add-btn weekly-slot__add-btn weekly-slot__add-btn--always-visible",
				title: time ? `Add moment at ${time}` : "Add moment",
				onClick: onStartScheduling,
				children: "+"
			}) : null
		})]
	});
}
//#endregion
//#region resources/js/shared/components/calendar/CalendarSectionHeader.tsx
function CalendarSectionHeader({ label, sublabel, badge }) {
	return /* @__PURE__ */ jsxs("header", {
		className: "calendar-section__header",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "calendar-section__label",
				children: label
			}),
			sublabel && /* @__PURE__ */ jsx("span", {
				className: "calendar-section__sublabel",
				children: sublabel
			}),
			badge && /* @__PURE__ */ jsx("span", {
				className: "calendar-section__badge",
				children: badge
			})
		]
	});
}
//#endregion
//#region resources/js/shared/components/calendar/CalendarViewToggle.tsx
/**
* 3-way view toggle: Daily | Weekly | Monthly.
* Replaces the 2-way ViewToggle in AuthenticatedLayout.
*/
function CalendarViewToggle() {
	const isDaily = route().current("daily");
	const isWeekly = route().current("weekly");
	const isMonthly = route().current("monthly");
	const btnCls = (active) => ["calendar-view-toggle__btn", active ? "calendar-view-toggle__btn--active" : ""].filter(Boolean).join(" ");
	return /* @__PURE__ */ jsxs("div", {
		className: "calendar-view-toggle",
		children: [
			/* @__PURE__ */ jsx(Link, {
				href: route("daily"),
				className: btnCls(!!isDaily),
				"aria-label": "Daily view",
				title: "Daily",
				children: /* @__PURE__ */ jsxs("svg", {
					xmlns: "http://www.w3.org/2000/svg",
					className: "h-5 w-5",
					fill: "none",
					viewBox: "0 0 24 24",
					stroke: "currentColor",
					strokeWidth: 2,
					children: [
						/* @__PURE__ */ jsx("rect", {
							x: "3",
							y: "4",
							width: "18",
							height: "18",
							rx: "2",
							ry: "2"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "16",
							y1: "2",
							x2: "16",
							y2: "6"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "8",
							y1: "2",
							x2: "8",
							y2: "6"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "3",
							y1: "10",
							x2: "21",
							y2: "10"
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(Link, {
				href: route("weekly"),
				className: btnCls(!!isWeekly),
				"aria-label": "Weekly view",
				title: "Weekly",
				children: /* @__PURE__ */ jsxs("svg", {
					xmlns: "http://www.w3.org/2000/svg",
					className: "h-5 w-5",
					fill: "none",
					viewBox: "0 0 24 24",
					stroke: "currentColor",
					strokeWidth: 2,
					children: [
						/* @__PURE__ */ jsx("rect", {
							x: "3",
							y: "3",
							width: "7",
							height: "7"
						}),
						/* @__PURE__ */ jsx("rect", {
							x: "14",
							y: "3",
							width: "7",
							height: "7"
						}),
						/* @__PURE__ */ jsx("rect", {
							x: "3",
							y: "14",
							width: "7",
							height: "7"
						}),
						/* @__PURE__ */ jsx("rect", {
							x: "14",
							y: "14",
							width: "7",
							height: "7"
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(Link, {
				href: route("monthly"),
				className: btnCls(!!isMonthly),
				"aria-label": "Monthly view",
				title: "Monthly",
				children: /* @__PURE__ */ jsxs("svg", {
					xmlns: "http://www.w3.org/2000/svg",
					className: "h-5 w-5",
					fill: "none",
					viewBox: "0 0 24 24",
					stroke: "currentColor",
					strokeWidth: 2,
					children: [
						/* @__PURE__ */ jsx("rect", {
							x: "3",
							y: "4",
							width: "18",
							height: "18",
							rx: "2",
							ry: "2"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "16",
							y1: "2",
							x2: "16",
							y2: "6"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "8",
							y1: "2",
							x2: "8",
							y2: "6"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "3",
							y1: "10",
							x2: "21",
							y2: "10"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "8",
							y1: "10",
							x2: "8",
							y2: "22"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "16",
							y1: "10",
							x2: "16",
							y2: "22"
						}),
						/* @__PURE__ */ jsx("line", {
							x1: "3",
							y1: "16",
							x2: "21",
							y2: "16"
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/shared/constants/moments.ts
/**
* Shared constants for moment-related UI.
* Used by ScheduleFields, ColorPicker, MomentForm, ConfigForm.
*/
var MOMENT_COLOR_PALETTE = [
	"#3B82F6",
	"#8B5CF6",
	"#10B981",
	"#EF4444",
	"#F59E0B",
	"#EC4899",
	"#06B6D4",
	"#84CC16",
	"#6366F1",
	"#F97316"
];
var WEEK_DAYS = [
	{
		label: "M",
		value: 1,
		full: "Monday"
	},
	{
		label: "T",
		value: 2,
		full: "Tuesday"
	},
	{
		label: "W",
		value: 3,
		full: "Wednesday"
	},
	{
		label: "T",
		value: 4,
		full: "Thursday"
	},
	{
		label: "F",
		value: 5,
		full: "Friday"
	},
	{
		label: "S",
		value: 6,
		full: "Saturday"
	},
	{
		label: "S",
		value: 7,
		full: "Sunday"
	}
];
var SCHEDULE_FREQUENCIES = [
	{
		label: "Daily",
		value: "daily"
	},
	{
		label: "Weekly",
		value: "weekly"
	},
	{
		label: "Custom",
		value: "custom"
	}
];
var MOMENT_FORM_SECTIONS = [
	{
		id: "basics",
		label: "Basics",
		emoji: "✏️"
	},
	{
		id: "cue",
		label: "Cue",
		emoji: "🔔"
	},
	{
		id: "reward",
		label: "Reward",
		emoji: "🏆"
	},
	{
		id: "schedule",
		label: "Schedule",
		emoji: "📅"
	}
];
//#endregion
//#region resources/js/shared/components/calendar/MomentFrequencyConfig.tsx
var ALL_DAYS$1 = [
	1,
	2,
	3,
	4,
	5,
	6,
	7
];
var WEEKDAYS$1 = [
	1,
	2,
	3,
	4,
	5
];
function sameSet(a, b) {
	if (a.length !== b.length) return false;
	return b.every((d) => a.includes(d));
}
function MomentFrequencyConfig({ state, onKindChange, onDaysChange, time, conflictCount = 0, dayLabels, onConfirm, onCancel }) {
	const kind = state.kind;
	const daysOfWeek = state.kind === SchedulingKind.Recurring ? state.daysOfWeek : [];
	const isAllDays = sameSet(daysOfWeek, ALL_DAYS$1);
	const isWeekdays = sameSet(daysOfWeek, WEEKDAYS$1);
	function toggleDay(day) {
		if (kind !== SchedulingKind.Recurring) return;
		onDaysChange(daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day].sort((a, b) => a - b));
	}
	function kindBtnCls(active) {
		return ["moment-frequency-config__kind-btn", active ? "moment-frequency-config__kind-btn--active" : ""].filter(Boolean).join(" ");
	}
	function presetBtnCls(active) {
		return ["moment-frequency-config__preset", active ? "moment-frequency-config__preset--active" : ""].filter(Boolean).join(" ");
	}
	function dayPillCls(active) {
		return ["moment-frequency-config__day-pill", active ? "moment-frequency-config__day-pill--active" : ""].filter(Boolean).join(" ");
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "moment-frequency-config",
		children: [
			time && /* @__PURE__ */ jsx("span", {
				className: "moment-frequency-config__time",
				children: time
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "moment-frequency-config__kind-group",
				role: "group",
				"aria-label": "Schedule kind",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: kindBtnCls(kind === SchedulingKind.OneOff),
					onClick: () => onKindChange(SchedulingKind.OneOff),
					children: "One-off"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: kindBtnCls(kind === SchedulingKind.Recurring),
					onClick: () => onKindChange(SchedulingKind.Recurring),
					children: "Recurring"
				})]
			}),
			kind === "recurring" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
				className: "moment-frequency-config__presets",
				role: "group",
				"aria-label": "Preset day patterns",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: presetBtnCls(isAllDays),
					onClick: () => onDaysChange([...ALL_DAYS$1]),
					children: "All days"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: presetBtnCls(isWeekdays),
					onClick: () => onDaysChange([...WEEKDAYS$1]),
					children: "Weekdays"
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "moment-frequency-config__days",
				role: "group",
				"aria-label": "Days of week",
				children: WEEK_DAYS.map((day, i) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: dayPillCls(daysOfWeek.includes(day.value)),
					"aria-label": day.full,
					"aria-pressed": daysOfWeek.includes(day.value),
					onClick: () => toggleDay(day.value),
					children: dayLabels?.[i] ?? day.label
				}, day.value))
			})] }),
			conflictCount > 0 && /* @__PURE__ */ jsxs("span", {
				className: "moment-frequency-config__conflicts",
				title: `${conflictCount} time slot(s) already have a moment`,
				children: [
					"⚠️ ",
					conflictCount,
					" conflict",
					conflictCount > 1 ? "s" : ""
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "moment-frequency-config__actions",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "moment-frequency-config__cancel",
					onClick: onCancel,
					children: "✕"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "moment-frequency-config__confirm",
					onClick: onConfirm,
					children: "✓ Confirm"
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/shared/components/calendar/FrequencyBadge.tsx
var FREQ_OPTIONS = [
	{
		label: "Daily",
		value: "daily"
	},
	{
		label: "Weekdays",
		value: "weekly"
	},
	{
		label: "Custom",
		value: "custom"
	},
	{
		label: "Once",
		value: "once"
	}
];
var ALL_DAYS = WEEK_DAYS.map((d) => d.value);
var WEEKDAYS = [
	1,
	2,
	3,
	4,
	5
];
function FrequencyBadge({ time, frequency, daysOfWeek, conflictCount = 0, onChange, onConfirm, onCancel }) {
	function handleFrequency(freq) {
		if (freq === "daily") onChange("daily", ALL_DAYS);
		else if (freq === "weekly") onChange("weekly", WEEKDAYS);
		else if (freq === "once") onChange("once", []);
		else onChange("custom", daysOfWeek);
	}
	function toggleDay(day) {
		if (frequency !== "custom") return;
		onChange("custom", daysOfWeek.includes(day) ? daysOfWeek.filter((d) => d !== day) : [...daysOfWeek, day].sort((a, b) => a - b));
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "frequency-bar",
		children: [
			time && /* @__PURE__ */ jsx("span", {
				className: "frequency-bar__time",
				children: time
			}),
			/* @__PURE__ */ jsx("div", {
				className: "frequency-bar__freq-group",
				role: "group",
				"aria-label": "Frequency",
				children: FREQ_OPTIONS.map((opt) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: ["frequency-bar__freq-btn", frequency === opt.value ? "frequency-bar__freq-btn--active" : ""].filter(Boolean).join(" "),
					onClick: () => handleFrequency(opt.value),
					children: opt.label
				}, opt.value))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "frequency-bar__days",
				role: "group",
				"aria-label": "Days of week",
				"aria-hidden": frequency === "once",
				style: frequency === "once" ? { display: "none" } : void 0,
				children: WEEK_DAYS.map((day) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: ["frequency-bar__day-pill", daysOfWeek.includes(day.value) ? "frequency-bar__day-pill--active" : ""].filter(Boolean).join(" "),
					"aria-label": day.full,
					"aria-pressed": daysOfWeek.includes(day.value),
					disabled: frequency !== "custom",
					onClick: () => toggleDay(day.value),
					children: day.label
				}, day.value))
			}),
			conflictCount > 0 && /* @__PURE__ */ jsxs("span", {
				className: "frequency-bar__conflicts",
				title: `${conflictCount} time slot(s) already have a moment`,
				children: [
					"⚠️ ",
					conflictCount,
					" conflict",
					conflictCount > 1 ? "s" : ""
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "frequency-bar__actions",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "frequency-bar__cancel",
					onClick: onCancel,
					children: "✕"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "frequency-bar__confirm",
					onClick: onConfirm,
					children: "✓ Confirm"
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/shared/components/calendar/AddMomentPopover.tsx
function AddMomentPopover({ isOpen, anchorRef, onClose, onSelectOnce, onSelectRecurring }) {
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
//#region resources/js/Layouts/AuthenticatedLayout.tsx
function Authenticated({ header, children }) {
	const user = usePage().props.auth.user;
	const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-gray-100",
		children: [
			/* @__PURE__ */ jsxs("nav", {
				className: "border-b border-gray-100 bg-white",
				children: [/* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex h-16 justify-between",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex",
								children: [/* @__PURE__ */ jsx("div", {
									className: "flex shrink-0 items-center",
									children: /* @__PURE__ */ jsx(Link, {
										href: "/",
										children: /* @__PURE__ */ jsx(ApplicationLogo, { className: "block h-9 w-9" })
									})
								}), /* @__PURE__ */ jsxs("div", {
									className: "hidden space-x-8 sm:-my-px sm:ms-10 sm:flex",
									children: [
										/* @__PURE__ */ jsx(NavLink, {
											href: route("daily"),
											active: route().current("daily"),
											children: "Daily"
										}),
										/* @__PURE__ */ jsx(NavLink, {
											href: route("weekly"),
											active: route().current("weekly"),
											children: "Weekly"
										}),
										/* @__PURE__ */ jsx(NavLink, {
											href: route("monthly"),
											active: route().current("monthly"),
											children: "Monthly"
										}),
										/* @__PURE__ */ jsx(NavLink, {
											href: route("config.edit"),
											active: route().current("config.edit"),
											children: "Config"
										})
									]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "hidden sm:ms-6 sm:flex sm:items-center",
								children: /* @__PURE__ */ jsx("div", {
									className: "relative ms-3",
									children: /* @__PURE__ */ jsxs(Dropdown, { children: [/* @__PURE__ */ jsx(Dropdown.Trigger, { children: /* @__PURE__ */ jsx("span", {
										className: "inline-flex rounded-md",
										children: /* @__PURE__ */ jsxs("button", {
											type: "button",
											className: "inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none",
											children: [user.first_name, /* @__PURE__ */ jsx("svg", {
												className: "-me-0.5 ms-2 h-4 w-4",
												xmlns: "http://www.w3.org/2000/svg",
												viewBox: "0 0 20 20",
												fill: "currentColor",
												children: /* @__PURE__ */ jsx("path", {
													fillRule: "evenodd",
													d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z",
													clipRule: "evenodd"
												})
											})]
										})
									}) }), /* @__PURE__ */ jsxs(Dropdown.Content, { children: [/* @__PURE__ */ jsx(Dropdown.Link, {
										href: route("profile.edit"),
										children: "Profile"
									}), /* @__PURE__ */ jsx(Dropdown.Link, {
										href: route("logout"),
										method: "post",
										as: "button",
										children: "Log Out"
									})] })] })
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "-me-2 flex items-center sm:hidden",
								children: [/* @__PURE__ */ jsx(CalendarViewToggle, {}), /* @__PURE__ */ jsx("button", {
									onClick: () => setShowingNavigationDropdown((previousState) => !previousState),
									className: "inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none",
									children: /* @__PURE__ */ jsxs("svg", {
										className: "h-6 w-6",
										stroke: "currentColor",
										fill: "none",
										viewBox: "0 0 24 24",
										children: [/* @__PURE__ */ jsx("path", {
											className: !showingNavigationDropdown ? "inline-flex" : "hidden",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "2",
											d: "M4 6h16M4 12h16M4 18h16"
										}), /* @__PURE__ */ jsx("path", {
											className: showingNavigationDropdown ? "inline-flex" : "hidden",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											strokeWidth: "2",
											d: "M6 18L18 6M6 6l12 12"
										})]
									})
								})]
							})
						]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-1 pb-3 pt-2",
						children: [
							/* @__PURE__ */ jsx(ResponsiveNavLink, {
								href: route("daily"),
								active: route().current("daily"),
								children: "Daily"
							}),
							/* @__PURE__ */ jsx(ResponsiveNavLink, {
								href: route("weekly"),
								active: route().current("weekly"),
								children: "Weekly"
							}),
							/* @__PURE__ */ jsx(ResponsiveNavLink, {
								href: route("monthly"),
								active: route().current("monthly"),
								children: "Monthly"
							}),
							/* @__PURE__ */ jsx(ResponsiveNavLink, {
								href: route("config.edit"),
								active: route().current("config.edit"),
								children: "Config"
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "border-t border-gray-200 pb-1 pt-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "px-4",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-base font-medium text-gray-800",
								children: user.first_name
							}), /* @__PURE__ */ jsx("div", {
								className: "text-sm font-medium text-gray-500",
								children: user.email
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-3 space-y-1",
							children: [/* @__PURE__ */ jsx(ResponsiveNavLink, {
								href: route("profile.edit"),
								children: "Profile"
							}), /* @__PURE__ */ jsx(ResponsiveNavLink, {
								method: "post",
								href: route("logout"),
								as: "button",
								children: "Log Out"
							})]
						})]
					})]
				})]
			}),
			header && /* @__PURE__ */ jsx("header", {
				className: "bg-white shadow",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8",
					children: header
				})
			}),
			/* @__PURE__ */ jsx("main", { children })
		]
	});
}
//#endregion
export { CalendarNav as C, SchedulingKind as S, CalendarProgressBar as _, MOMENT_COLOR_PALETTE as a, MOMENT_ICONS as b, WEEK_DAYS as c, MomentDisplay as d, computeWindowStart as f, CalendarSection as g, jsToIsoDay as h, MomentFrequencyConfig as i, CalendarSectionHeader as l, isOutOfOffice as m, AddMomentPopover as n, MOMENT_FORM_SECTIONS as o, getVisibleTimeSlots as p, FrequencyBadge as r, SCHEDULE_FREQUENCIES as s, Authenticated as t, CalendarSectionArticle as u, CalendarMomentCard as v, MomentStatus as x, ICON_CATEGORIES as y };
