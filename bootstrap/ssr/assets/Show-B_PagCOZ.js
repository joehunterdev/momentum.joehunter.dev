import { Head, Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/Pages/Content/Show.tsx
function Show({ content, locale, alternates, appUrl }) {
	const { seo, hero, sections, cta } = content;
	const isExternal = cta?.href?.startsWith("http");
	const canonicalUrl = `${appUrl}/${locale}/${content.slug}`;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Head, {
		title: seo.title,
		children: [
			/* @__PURE__ */ jsx("meta", {
				"head-key": "description",
				name: "description",
				content: seo.description
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "keywords",
				name: "keywords",
				content: seo.keywords
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:title",
				property: "og:title",
				content: seo.title
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:description",
				property: "og:description",
				content: seo.description
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:url",
				property: "og:url",
				content: canonicalUrl
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:image",
				property: "og:image",
				content: `${appUrl}/og-image.png`
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:locale",
				property: "og:locale",
				content: locale === "es" ? "es_ES" : "en_GB"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:card",
				name: "twitter:card",
				content: "summary_large_image"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:title",
				name: "twitter:title",
				content: seo.title
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:description",
				name: "twitter:description",
				content: seo.description
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:image",
				name: "twitter:image",
				content: `${appUrl}/og-image.png`
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "canonical",
				href: canonicalUrl
			}),
			Object.entries(alternates).map(([altLocale, altUrl]) => /* @__PURE__ */ jsx("link", {
				rel: "alternate",
				hrefLang: altLocale,
				href: altUrl
			}, altLocale))
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "content-page",
		children: [/* @__PURE__ */ jsx("div", {
			className: "content-page__glow",
			"aria-hidden": true
		}), /* @__PURE__ */ jsxs("div", {
			className: "content-page__inner",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "content-page__header",
					children: [/* @__PURE__ */ jsx(Link, {
						href: "/",
						className: "content-page__logo-link",
						children: /* @__PURE__ */ jsx("img", {
							src: "/logo_75.png",
							alt: "Momentum",
							className: "content-page__logo"
						})
					}), /* @__PURE__ */ jsxs("nav", {
						className: "content-page__nav",
						children: [
							Object.entries(alternates).map(([altLocale, altUrl]) => altLocale !== locale ? /* @__PURE__ */ jsx(Link, {
								href: altUrl,
								className: "content-page__lang-link",
								children: altLocale.toUpperCase()
							}, altLocale) : null),
							/* @__PURE__ */ jsx(Link, {
								href: route("login"),
								className: "content-page__nav-link",
								children: "Log in"
							}),
							/* @__PURE__ */ jsx(Link, {
								href: route("register"),
								className: "content-page__nav-link content-page__nav-link--primary",
								children: "Get started"
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "content-page__hero",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "content-page__badge",
							children: hero.badge
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "content-page__headline",
							children: hero.headline
						}),
						/* @__PURE__ */ jsx("p", {
							className: "content-page__subline",
							children: hero.subline
						}),
						content.publishedAt && /* @__PURE__ */ jsx("time", {
							className: "content-page__date",
							dateTime: content.publishedAt,
							children: new Date(content.publishedAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
								year: "numeric",
								month: "long",
								day: "numeric"
							})
						})
					]
				}),
				/* @__PURE__ */ jsx("article", {
					className: "content-page__body",
					children: sections.map((section, i) => /* @__PURE__ */ jsxs("section", {
						className: "content-page__section",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "content-page__section-heading",
								children: section.heading
							}),
							section.type === "text" && section.body && /* @__PURE__ */ jsx("p", {
								className: "content-page__section-body",
								children: section.body
							}),
							section.type === "features" && section.items && /* @__PURE__ */ jsx("div", {
								className: "content-page__features",
								children: section.items.map((item, j) => /* @__PURE__ */ jsxs("div", {
									className: "content-page__feature-card",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "content-page__feature-icon",
											children: item.icon
										}),
										/* @__PURE__ */ jsx("h3", {
											className: "content-page__feature-title",
											children: item.title
										}),
										/* @__PURE__ */ jsx("p", {
											className: "content-page__feature-desc",
											children: item.description
										})
									]
								}, j))
							})
						]
					}, i))
				}),
				cta && /* @__PURE__ */ jsx("div", {
					className: "content-page__cta-wrap",
					children: isExternal ? /* @__PURE__ */ jsx("a", {
						href: cta.href,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "content-page__cta",
						children: cta.text
					}) : /* @__PURE__ */ jsx(Link, {
						href: cta.href,
						className: "content-page__cta",
						children: cta.text
					})
				}),
				/* @__PURE__ */ jsx("footer", {
					className: "content-page__footer",
					children: /* @__PURE__ */ jsxs("p", { children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" Momentum ·",
						" ",
						/* @__PURE__ */ jsx("a", {
							href: "https://joehunter.es",
							target: "_blank",
							rel: "noopener noreferrer",
							children: "joehunter.es"
						})
					] })
				})
			]
		})]
	})] });
}
//#endregion
export { Show as default };
