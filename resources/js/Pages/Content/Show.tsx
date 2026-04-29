import { Head, Link } from '@inertiajs/react';

interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

interface Section {
    type: 'text' | 'features';
    heading: string;
    body?: string;
    items?: FeatureItem[];
}

interface ContentData {
    slug: string;
    locale: string;
    alternate?: Record<string, string>;
    type?: string;
    publishedAt?: string;
    seo: {
        title: string;
        description: string;
        keywords: string;
    };
    hero: {
        badge: string;
        headline: string;
        subline: string;
    };
    sections: Section[];
    cta?: {
        text: string;
        href: string;
    };
}

interface Props {
    content: ContentData;
    locale: string;
    alternates: Record<string, string>;
    appUrl: string;
}

export default function Show({ content, locale, alternates, appUrl }: Props) {
    const { seo, hero, sections, cta } = content;
    const isExternal = cta?.href?.startsWith('http');
    const canonicalUrl = `${appUrl}/${locale}/${content.slug}`;

    return (
        <>
            <Head title={seo.title}>
                <meta head-key="description" name="description" content={seo.description} />
                <meta head-key="keywords" name="keywords" content={seo.keywords} />
                <meta head-key="og:title" property="og:title" content={seo.title} />
                <meta head-key="og:description" property="og:description" content={seo.description} />
                <meta head-key="og:url" property="og:url" content={canonicalUrl} />
                <meta head-key="og:image" property="og:image" content={`${appUrl}/og-image.png`} />
                <meta head-key="og:locale" property="og:locale" content={locale === 'es' ? 'es_ES' : 'en_GB'} />
                <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta head-key="twitter:title" name="twitter:title" content={seo.title} />
                <meta head-key="twitter:description" name="twitter:description" content={seo.description} />
                <meta head-key="twitter:image" name="twitter:image" content={`${appUrl}/og-image.png`} />
                <link rel="canonical" href={canonicalUrl} />
                {Object.entries(alternates).map(([altLocale, altUrl]) => (
                    <link key={altLocale} rel="alternate" hrefLang={altLocale} href={altUrl} />
                ))}
            </Head>

            <div className="content-page">
                <div className="content-page__glow" aria-hidden />

                <div className="content-page__inner">
                    {/* Nav */}
                    <header className="content-page__header">
                        <Link href="/" className="content-page__logo-link">
                            <img src="/logo.png" alt="Momentum" className="content-page__logo" />
                        </Link>

                        <nav className="content-page__nav">
                            {/* Language switcher */}
                            {Object.entries(alternates).map(([altLocale, altUrl]) =>
                                altLocale !== locale ? (
                                    <Link key={altLocale} href={altUrl} className="content-page__lang-link">
                                        {altLocale.toUpperCase()}
                                    </Link>
                                ) : null,
                            )}
                            <Link href={route('login')} className="content-page__nav-link">
                                Log in
                            </Link>
                            <Link href={route('register')} className="content-page__nav-link content-page__nav-link--primary">
                                Get started
                            </Link>
                        </nav>
                    </header>

                    {/* Hero */}
                    <section className="content-page__hero">
                        <span className="content-page__badge">{hero.badge}</span>
                        <h1 className="content-page__headline">{hero.headline}</h1>
                        <p className="content-page__subline">{hero.subline}</p>
                        {content.publishedAt && (
                            <time className="content-page__date" dateTime={content.publishedAt}>
                                {new Date(content.publishedAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
                        )}
                    </section>

                    {/* Sections */}
                    <article className="content-page__body">
                        {sections.map((section, i) => (
                            <section key={i} className="content-page__section">
                                <h2 className="content-page__section-heading">{section.heading}</h2>

                                {section.type === 'text' && section.body && (
                                    <p className="content-page__section-body">{section.body}</p>
                                )}

                                {section.type === 'features' && section.items && (
                                    <div className="content-page__features">
                                        {section.items.map((item, j) => (
                                            <div key={j} className="content-page__feature-card">
                                                <span className="content-page__feature-icon">{item.icon}</span>
                                                <h3 className="content-page__feature-title">{item.title}</h3>
                                                <p className="content-page__feature-desc">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </article>

                    {/* CTA */}
                    {cta && (
                        <div className="content-page__cta-wrap">
                            {isExternal ? (
                                <a href={cta.href} target="_blank" rel="noopener noreferrer" className="content-page__cta">
                                    {cta.text}
                                </a>
                            ) : (
                                <Link href={cta.href} className="content-page__cta">
                                    {cta.text}
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <footer className="content-page__footer">
                        <p>
                            &copy; {new Date().getFullYear()} Momentum &middot;{' '}
                            <a href="https://joehunter.es" target="_blank" rel="noopener noreferrer">
                                joehunter.es
                            </a>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
