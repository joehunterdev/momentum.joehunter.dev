import { jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from "react";
//#region resources/js/features/weekly/hooks/useSwipeComplete.ts
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
//#region resources/js/features/weekly/components/SlotMomentIcon.tsx
function SlotMomentIcon({ moment, date, onToggle, onSwipeProgress, isStatic = false }) {
	const isPast = moment.status === "completed" || moment.status === "missed";
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
			children: moment.icon ?? (moment.name ?? "U").charAt(0).toUpperCase()
		})]
	});
}
//#endregion
export { SlotMomentIcon as t };
