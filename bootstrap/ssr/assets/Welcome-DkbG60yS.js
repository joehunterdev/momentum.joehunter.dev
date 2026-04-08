import { Head, Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Welcome.tsx
var features = [
	{
		icon: "📅",
		title: "Weekly View",
		description: "See your entire week at a glance. Every moment, every slot, colour-coded by status.",
		href: "/en/weekly-habit-view"
	},
	{
		icon: "⚡",
		title: "Daily Schedule",
		description: "Your day laid out in 30-minute slots from wake to sleep. Know exactly what's next.",
		href: "/en/daily-habit-schedule"
	},
	{
		icon: "📈",
		title: "Dashboard",
		description: "Track completion rates, streaks, and consistency across all your moments over time.",
		href: "/en/features"
	},
	{
		icon: "🎯",
		title: "Moment Builder",
		description: "Define habits with cues, stacks, environment prompts and rewards — the full system.",
		href: "/en/habit-stacking"
	}
];
function Welcome({ auth }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Head, {
		title: "Momentum — Build better habits",
		children: [
			/* @__PURE__ */ jsx("meta", {
				"head-key": "description",
				name: "description",
				content: "Momentum helps you design, schedule and stick to the habits that matter — backed by proven behaviour science."
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:title",
				property: "og:title",
				content: "Momentum — Build better habits"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:description",
				property: "og:description",
				content: "Momentum helps you design, schedule and stick to the habits that matter — backed by proven behaviour science."
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:image",
				property: "og:image",
				content: "https://momentum.joehunter.dev/og-image.png"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:url",
				property: "og:url",
				content: "https://momentum.joehunter.dev"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:card",
				name: "twitter:card",
				content: "summary_large_image"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:image",
				name: "twitter:image",
				content: "https://momentum.joehunter.dev/og-image.png"
			})
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "welcome-page",
		children: [/* @__PURE__ */ jsx("div", {
			className: "welcome-page__glow",
			"aria-hidden": true
		}), /* @__PURE__ */ jsxs("div", {
			className: "welcome-page__inner",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "welcome-page__header",
					children: [/* @__PURE__ */ jsx("img", {
						src: "/logo_75.png",
						alt: "Momentum",
						className: "welcome-page__logo"
					}), /* @__PURE__ */ jsx("nav", {
						className: "welcome-page__nav",
						children: auth.user ? /* @__PURE__ */ jsx(Link, {
							href: route("weekly"),
							className: "welcome-page__nav-link welcome-page__nav-link--primary",
							children: "Open app"
						}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Link, {
							href: route("login"),
							className: "welcome-page__nav-link",
							children: "Log in"
						}), /* @__PURE__ */ jsx(Link, {
							href: route("register"),
							className: "welcome-page__nav-link welcome-page__nav-link--primary",
							children: "Get started"
						})] })
					})]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "welcome-page__hero",
					children: [
						/* @__PURE__ */ jsxs("h1", {
							className: "welcome-page__headline",
							children: [
								"Build momentum,",
								/* @__PURE__ */ jsx("br", {}),
								"one habit at a time."
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "welcome-page__subline",
							children: "Momentum helps you design, schedule and stick to the habits that matter — backed by proven behaviour science."
						}),
						!auth.user && /* @__PURE__ */ jsx(Link, {
							href: route("register"),
							className: "welcome-page__cta",
							children: "Start for free"
						})
					]
				}),
				/* @__PURE__ */ jsx("section", {
					className: "welcome-page__features",
					children: features.map((f) => /* @__PURE__ */ jsxs(Link, {
						href: f.href,
						className: "welcome-page__card",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "welcome-page__card-icon",
								children: f.icon
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "welcome-page__card-title",
								children: f.title
							}),
							/* @__PURE__ */ jsx("p", {
								className: "welcome-page__card-body",
								children: f.description
							}),
							/* @__PURE__ */ jsx("span", {
								className: "welcome-page__card-arrow",
								children: "→"
							})
						]
					}, f.title))
				})
			]
		})]
	})] });
}
//#endregion
export { Welcome as default };
