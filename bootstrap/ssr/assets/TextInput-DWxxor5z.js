import { jsx } from "react/jsx-runtime";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
//#region resources/js/Components/TextInput.tsx
var TextInput_default = forwardRef(function TextInput({ type = "text", className = "", isFocused = false, ...props }, ref) {
	const localRef = useRef(null);
	useImperativeHandle(ref, () => ({ focus: () => localRef.current?.focus() }));
	useEffect(() => {
		if (isFocused) localRef.current?.focus();
	}, [isFocused]);
	return /* @__PURE__ */ jsx("input", {
		...props,
		type,
		className: "mm-input border-gray-300 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 " + className,
		ref: localRef
	});
});
//#endregion
export { TextInput_default as t };
