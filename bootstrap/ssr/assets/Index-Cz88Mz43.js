import { t as Authenticated } from "./AuthenticatedLayout-Se8rC2mR.js";
import { t as FlashMessage } from "./FlashMessage-BBodC94Y.js";
import { Head, Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import axios from "axios";
//#region resources/js/shared/components/EmptyState.tsx
function EmptyState({ title, description, actionLabel, actionHref }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-6 py-16 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mb-4 text-5xl",
				children: "✨"
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mb-2 text-lg font-semibold text-gray-800",
				children: title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mb-6 max-w-sm text-sm text-gray-500",
				children: description
			}),
			actionLabel && actionHref && /* @__PURE__ */ jsx(Link, {
				href: actionHref,
				className: "inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700",
				children: actionLabel
			})
		]
	});
}
//#endregion
//#region resources/js/shared/utils/dates.ts
/**
* Format a YYYY-MM-DD string as a human-readable date.
* e.g. "2026-04-05" → "Saturday, 5 April 2026"
*/
function formatDate(dateString) {
	const [year, month, day] = dateString.split("-").map(Number);
	return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}
//#endregion
//#region resources/js/features/daily/components/StreakBadge.tsx
function StreakBadge({ count }) {
	if (count === 0) return /* @__PURE__ */ jsx("span", {
		className: "text-xs text-gray-400",
		children: "0"
	});
	return /* @__PURE__ */ jsxs("span", {
		className: "inline-flex items-center gap-0.5 text-sm font-semibold text-orange-500",
		children: ["🔥 ", count]
	});
}
//#endregion
//#region resources/js/features/daily/components/MomentCard.tsx
function MomentCard({ moment, date, onToggled }) {
	const [isLoading, setIsLoading] = useState(false);
	const isCompleted = moment.completed_at !== null;
	const accentStyle = moment.color ? {
		backgroundColor: `${moment.color}18`,
		borderLeftColor: moment.color,
		borderLeftWidth: "4px"
	} : {};
	async function handleToggle() {
		if (isLoading) return;
		onToggled(moment.id, isCompleted ? null : (/* @__PURE__ */ new Date()).toISOString(), moment.instance_id);
		setIsLoading(true);
		try {
			const response = await axios.post(route("moments.toggle", moment.id), { date });
			onToggled(moment.id, response.data.completed_at, response.data.instance_id);
		} catch {
			onToggled(moment.id, moment.completed_at, moment.instance_id);
		} finally {
			setIsLoading(false);
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all",
		style: accentStyle,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex min-w-0 flex-1 items-center gap-3",
			children: [moment.icon && /* @__PURE__ */ jsx("span", {
				className: "shrink-0 text-2xl",
				"aria-hidden": "true",
				children: moment.icon
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ jsx("p", {
					className: `truncate font-medium ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`,
					children: moment.name
				}), moment.identity_statement && /* @__PURE__ */ jsx("p", {
					className: "truncate text-xs text-gray-400",
					children: moment.identity_statement
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "ml-4 flex shrink-0 items-center gap-4",
			children: [/* @__PURE__ */ jsx(StreakBadge, { count: moment.streak }), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: handleToggle,
				disabled: isLoading,
				"aria-label": isCompleted ? "Mark incomplete" : "Mark complete",
				className: `flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${isCompleted ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-300 bg-white hover:border-indigo-400"} ${isLoading ? "opacity-50" : ""}`,
				children: isCompleted && /* @__PURE__ */ jsx("svg", {
					className: "h-4 w-4",
					viewBox: "0 0 16 16",
					fill: "currentColor",
					children: /* @__PURE__ */ jsx("path", { d: "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" })
				})
			})]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Daily/Index.tsx
function Index({ date, moments: initialMoments }) {
	const [moments, setMoments] = useState(initialMoments);
	function handleToggled(id, completedAt, instanceId) {
		setMoments((prev) => prev.map((m) => m.id === id ? {
			...m,
			completed_at: completedAt,
			instance_id: instanceId
		} : m));
	}
	const completedCount = moments.filter((m) => m.completed_at !== null).length;
	const totalCount = moments.length;
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsxs("div", {
			className: "flex items-baseline justify-between",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-xl font-semibold text-gray-800",
				children: formatDate(date)
			}), totalCount > 0 && /* @__PURE__ */ jsxs("span", {
				className: "text-sm text-gray-500",
				children: [
					completedCount,
					"/",
					totalCount,
					" done"
				]
			})]
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Daily" }),
			/* @__PURE__ */ jsx(FlashMessage, {}),
			/* @__PURE__ */ jsx("div", {
				className: "py-8",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-2xl px-4 sm:px-6 lg:px-8",
					children: moments.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
						title: "No moments for today",
						description: "Add your first habit moment to start building your streak.",
						actionLabel: "+ Add Moment",
						actionHref: route("moments.create")
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
						className: "space-y-3",
						children: moments.map((moment) => /* @__PURE__ */ jsx(MomentCard, {
							moment,
							date,
							onToggled: handleToggled
						}, moment.id))
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-8 flex justify-center",
						children: /* @__PURE__ */ jsxs(Link, {
							href: route("moments.create"),
							className: "inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-5 py-2.5 text-sm font-medium text-indigo-600 transition hover:border-indigo-500 hover:bg-indigo-50",
							children: [/* @__PURE__ */ jsx("span", { children: "+" }), " New Moment"]
						})
					})] })
				})
			})
		]
	});
}
//#endregion
export { Index as default };
