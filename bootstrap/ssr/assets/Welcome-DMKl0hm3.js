import { Head, Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
//#region resources/js/shared/components/Cubes.tsx
var Cubes = ({ gridSize = 8, cubeSize, maxAngle = 45, radius = 3, easing = "power3.out", duration = {
	enter: .3,
	leave: .6
}, cellGap, borderStyle = "1px solid #fff", faceColor = "#120F17", shadow = false, autoAnimate = true, rippleOnClick = true, rippleColor = "#fff", rippleSpeed = 2, colorPattern = "solid", primaryColor = "#8B6BAE", secondaryColor = "#00E5AA" }) => {
	const sceneRef = useRef(null);
	const rafRef = useRef(null);
	const idleTimerRef = useRef(null);
	const userActiveRef = useRef(false);
	const simPosRef = useRef({
		x: 0,
		y: 0
	});
	const simTargetRef = useRef({
		x: 0,
		y: 0
	});
	const simRAFRef = useRef(null);
	const colGap = typeof cellGap === "number" ? `${cellGap}px` : cellGap?.col !== void 0 ? `${cellGap.col}px` : "5%";
	const rowGap = typeof cellGap === "number" ? `${cellGap}px` : cellGap?.row !== void 0 ? `${cellGap.row}px` : "5%";
	const enterDur = duration.enter;
	const leaveDur = duration.leave;
	const tiltAt = useCallback((rowCenter, colCenter) => {
		if (!sceneRef.current) return;
		sceneRef.current.querySelectorAll(".cube").forEach((cube) => {
			const element = cube;
			const r = +element.dataset.row;
			const c = +element.dataset.col;
			const dist = Math.hypot(r - rowCenter, c - colCenter);
			if (dist <= radius) {
				const angle = (1 - dist / radius) * maxAngle;
				gsap.to(cube, {
					duration: enterDur,
					ease: easing,
					overwrite: true,
					rotateX: -angle,
					rotateY: angle
				});
			} else gsap.to(cube, {
				duration: leaveDur,
				ease: "power3.out",
				overwrite: true,
				rotateX: 0,
				rotateY: 0
			});
		});
	}, [
		radius,
		maxAngle,
		enterDur,
		leaveDur,
		easing
	]);
	const onPointerMove = useCallback((e) => {
		userActiveRef.current = true;
		if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
		const rect = sceneRef.current.getBoundingClientRect();
		const cellW = rect.width / gridSize;
		const cellH = rect.height / gridSize;
		const colCenter = (e.clientX - rect.left) / cellW;
		const rowCenter = (e.clientY - rect.top) / cellH;
		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
		idleTimerRef.current = setTimeout(() => {
			userActiveRef.current = false;
		}, 3e3);
	}, [gridSize, tiltAt]);
	const resetAll = useCallback(() => {
		if (!sceneRef.current) return;
		sceneRef.current.querySelectorAll(".cube").forEach((cube) => gsap.to(cube, {
			duration: leaveDur,
			rotateX: 0,
			rotateY: 0,
			ease: "power3.out"
		}));
	}, [leaveDur]);
	const onTouchMove = useCallback((e) => {
		e.preventDefault();
		userActiveRef.current = true;
		if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
		const rect = sceneRef.current.getBoundingClientRect();
		const cellW = rect.width / gridSize;
		const cellH = rect.height / gridSize;
		const touch = e.touches[0];
		const colCenter = (touch.clientX - rect.left) / cellW;
		const rowCenter = (touch.clientY - rect.top) / cellH;
		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
		idleTimerRef.current = setTimeout(() => {
			userActiveRef.current = false;
		}, 3e3);
	}, [gridSize, tiltAt]);
	const onTouchStart = useCallback(() => {
		userActiveRef.current = true;
	}, []);
	const onTouchEnd = useCallback(() => {
		if (!sceneRef.current) return;
		resetAll();
	}, [resetAll]);
	const onClick = useCallback((e) => {
		if (!rippleOnClick || !sceneRef.current) return;
		const rect = sceneRef.current.getBoundingClientRect();
		const cellW = rect.width / gridSize;
		const cellH = rect.height / gridSize;
		const clientX = "clientX" in e ? e.clientX : e.touches && e.touches[0].clientX;
		const clientY = "clientY" in e ? e.clientY : e.touches && e.touches[0].clientY;
		const colHit = Math.floor((clientX - rect.left) / cellW);
		const rowHit = Math.floor((clientY - rect.top) / cellH);
		const baseRingDelay = .15;
		const baseAnimDur = .3;
		const baseHold = .6;
		const spreadDelay = baseRingDelay / rippleSpeed;
		const animDuration = baseAnimDur / rippleSpeed;
		const holdTime = baseHold / rippleSpeed;
		const rings = {};
		sceneRef.current.querySelectorAll(".cube").forEach((cube) => {
			const element = cube;
			const r = +element.dataset.row;
			const c = +element.dataset.col;
			const dist = Math.hypot(r - rowHit, c - colHit);
			const ring = Math.round(dist);
			if (!rings[ring]) rings[ring] = [];
			rings[ring].push(cube);
		});
		Object.keys(rings).map(Number).sort((a, b) => a - b).forEach((ring) => {
			const delay = ring * spreadDelay;
			const faces = rings[ring].flatMap((cube) => Array.from(cube.querySelectorAll(".cube-face")));
			gsap.to(faces, {
				backgroundColor: rippleColor,
				duration: animDuration,
				delay,
				ease: "power3.out"
			});
			gsap.to(faces, {
				backgroundColor: faceColor,
				duration: animDuration,
				delay: delay + animDuration + holdTime,
				ease: "power3.out"
			});
		});
	}, [
		rippleOnClick,
		gridSize,
		faceColor,
		rippleColor,
		rippleSpeed
	]);
	useEffect(() => {
		if (!autoAnimate || !sceneRef.current) return;
		simPosRef.current = {
			x: Math.random() * gridSize,
			y: Math.random() * gridSize
		};
		simTargetRef.current = {
			x: Math.random() * gridSize,
			y: Math.random() * gridSize
		};
		const speed = .02;
		const loop = () => {
			if (!userActiveRef.current) {
				const pos = simPosRef.current;
				const tgt = simTargetRef.current;
				pos.x += (tgt.x - pos.x) * speed;
				pos.y += (tgt.y - pos.y) * speed;
				tiltAt(pos.y, pos.x);
				if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < .1) simTargetRef.current = {
					x: Math.random() * gridSize,
					y: Math.random() * gridSize
				};
			}
			simRAFRef.current = requestAnimationFrame(loop);
		};
		simRAFRef.current = requestAnimationFrame(loop);
		return () => {
			if (simRAFRef.current != null) cancelAnimationFrame(simRAFRef.current);
		};
	}, [
		autoAnimate,
		gridSize,
		tiltAt
	]);
	useEffect(() => {
		const el = sceneRef.current;
		if (!el) return;
		el.addEventListener("pointermove", onPointerMove);
		el.addEventListener("pointerleave", resetAll);
		el.addEventListener("click", onClick);
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchend", onTouchEnd, { passive: true });
		return () => {
			el.removeEventListener("pointermove", onPointerMove);
			el.removeEventListener("pointerleave", resetAll);
			el.removeEventListener("click", onClick);
			el.removeEventListener("touchmove", onTouchMove);
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchend", onTouchEnd);
			rafRef.current != null && cancelAnimationFrame(rafRef.current);
			idleTimerRef.current && clearTimeout(idleTimerRef.current);
		};
	}, [
		onPointerMove,
		resetAll,
		onClick,
		onTouchMove,
		onTouchStart,
		onTouchEnd
	]);
	const getCubeBorderColor = (row, col) => {
		if (colorPattern === "solid") return borderStyle.includes("#") ? borderStyle : primaryColor;
		const isPurpleTop = row >= 0 && row <= 3 && col >= 0 && col <= 11;
		const isPurpleLeft = row >= 0 && row <= 11 && col >= 0 && col <= 3;
		const isPurpleBottom = row >= 8 && row <= 11 && col >= 0 && col <= 8;
		const isTealTop = row >= 2 && row <= 5 && col >= 3 && col <= 11;
		const isTealRight = row >= 2 && row <= 11 && col >= 8 && col <= 11;
		const isTealBottom = row >= 8 && row <= 11 && col >= 3 && col <= 11;
		if (isPurpleTop || isPurpleLeft || isPurpleBottom) return primaryColor;
		else if (isTealTop || isTealRight || isTealBottom) return secondaryColor;
		return "rgba(156, 163, 175, 0.3)";
	};
	const cells = Array.from({ length: gridSize });
	const sceneStyle = {
		gridTemplateColumns: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
		gridTemplateRows: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
		columnGap: colGap,
		rowGap
	};
	return /* @__PURE__ */ jsx("div", {
		className: "default-animation",
		style: {
			"--cube-face-border": borderStyle,
			"--cube-face-bg": faceColor,
			"--cube-face-shadow": shadow === true ? "0 0 6px rgba(0,0,0,.5)" : shadow || "none",
			...cubeSize ? {
				width: `${gridSize * cubeSize}px`,
				height: `${gridSize * cubeSize}px`
			} : {}
		},
		children: /* @__PURE__ */ jsx("div", {
			ref: sceneRef,
			className: "default-animation--scene",
			style: sceneStyle,
			children: cells.map((_, r) => cells.map((__, c) => {
				const cubeBorderColor = getCubeBorderColor(r, c);
				const cubeStyle = colorPattern === "m-shape" ? {
					"--cube-face-border": `1px solid ${cubeBorderColor}`,
					"--cube-face-bg": "transparent"
				} : {};
				return /* @__PURE__ */ jsxs("div", {
					className: "cube",
					"data-row": r,
					"data-col": c,
					style: cubeStyle,
					children: [
						/* @__PURE__ */ jsx("div", { className: "cube-face cube-face--top" }),
						/* @__PURE__ */ jsx("div", { className: "cube-face cube-face--bottom" }),
						/* @__PURE__ */ jsx("div", { className: "cube-face cube-face--left" }),
						/* @__PURE__ */ jsx("div", { className: "cube-face cube-face--right" }),
						/* @__PURE__ */ jsx("div", { className: "cube-face cube-face--front" }),
						/* @__PURE__ */ jsx("div", { className: "cube-face cube-face--back" })
					]
				}, `${r}-${c}`);
			}))
		})
	});
};
//#endregion
//#region resources/js/Pages/Welcome.tsx
var features = [
	{
		icon: "✏️",
		title: "Moment Creation",
		description: "Build habits step by step — name it, set a cue, choose a schedule, and lock it in.",
		href: "/en/habit-stacking"
	},
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
						src: "/logo.png",
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
					children: [/* @__PURE__ */ jsxs("div", {
						className: "welcome-page__hero-content",
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
					}), /* @__PURE__ */ jsx("div", {
						className: "welcome-page__hero-animation",
						children: /* @__PURE__ */ jsx(Cubes, {
							gridSize: 12,
							maxAngle: 60,
							radius: 4,
							borderStyle: "1px solid rgba(156, 163, 175, 0.3)",
							faceColor: "transparent",
							rippleColor: "#8B6BAE",
							rippleSpeed: 1.5,
							autoAnimate: true,
							rippleOnClick: true,
							cellGap: 6,
							colorPattern: "m-shape",
							primaryColor: "#8B6BAE",
							secondaryColor: "#00E5AA"
						})
					})]
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
