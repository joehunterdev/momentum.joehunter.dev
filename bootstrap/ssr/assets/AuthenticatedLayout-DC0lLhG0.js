import { t as ApplicationLogo } from "./ApplicationLogo-CUBrZIwV.js";
import { Link, router, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { Transition } from "@headlessui/react";
import "date-fns";
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
//#region resources/js/shared/components/calendar/utils.ts
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
export { CalendarNav as a, jsToIsoDay as i, computeWindowStart as n, isOutOfOffice as r, Authenticated as t };
