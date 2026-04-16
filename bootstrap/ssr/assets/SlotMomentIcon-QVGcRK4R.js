import { jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useRef, useState } from "react";
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
function SlotMomentIcon({ moment, date, onToggle, onSwipeProgress, isStatic = false }) {
	moment.status;
	const { dragX, isDragging, isDone, handlers } = useSwipeComplete({
		onComplete: () => onToggle(moment.id, moment.instance_id, date),
		onProgressChange: onSwipeProgress,
		threshold: moment.status === "completed" || moment.status === "missed" ? 180 : 100,
		disabled: isStatic
	});
	const statusClass = moment.status ? `slot-icon--${moment.status}` : "slot-icon--future";
	const swipeClass = !isStatic && (isDone ? "slot-icon--done" : isDragging || dragX > 0 ? "slot-icon--swiping" : "");
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
				cursor: "grab"
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
