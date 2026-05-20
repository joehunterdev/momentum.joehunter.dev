import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import Cubes from '@/shared/components/Cubes';

const features = [
    {
        icon: '✏️',
        title: 'Moment Creation',
        description: 'Build habits step by step — name it, set a cue, choose a schedule, and lock it in.',
        href: '/en/habit-stacking',
    },
    {
        icon: '\uD83D\uDCC5',
        title: 'Weekly View',
        description: 'See your entire week at a glance. Every moment, every slot, colour-coded by status.',
        href: '/en/weekly-habit-view',
    },
    {
        icon: '\u26A1',
        title: 'Daily Schedule',
        description: "Your day laid out in 30-minute slots from wake to sleep. Know exactly what's next.",
        href: '/en/daily-habit-schedule',
    },
    {
        icon: '\uD83D\uDCC8',
        title: 'Dashboard',
        description: 'Track completion rates, streaks, and consistency across all your moments over time.',
        href: '/en/features',
    },
    {
        icon: '\uD83C\uDFAF',
        title: 'Moment Builder',
        description: 'Define habits with cues, stacks, environment prompts and rewards \u2014 the full system.',
        href: '/en/habit-stacking',
    },
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Momentum — Build better habits">
                <meta head-key="description" name="description" content="Momentum helps you design, schedule and stick to the habits that matter — backed by proven behaviour science." />
                <meta head-key="og:title" property="og:title" content="Momentum — Build better habits" />
                <meta head-key="og:description" property="og:description" content="Momentum helps you design, schedule and stick to the habits that matter — backed by proven behaviour science." />
                <meta head-key="og:image" property="og:image" content="https://momentum.joehunter.dev/og-image.png" />
                <meta head-key="og:url" property="og:url" content="https://momentum.joehunter.dev" />
                <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
                <meta head-key="twitter:image" name="twitter:image" content="https://momentum.joehunter.dev/og-image.png" />
            </Head>

            <div className="welcome-page">
                <div className="welcome-page__glow" aria-hidden />

                <div className="welcome-page__inner">
                    <header className="welcome-page__header">
                        <img src="/logo.png" alt="Momentum" className="welcome-page__logo" />
                        <nav className="welcome-page__nav">
                            {auth.user ? (
                                <Link href={route('weekly')} className="welcome-page__nav-link welcome-page__nav-link--primary">
                                    Open app
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="welcome-page__nav-link">
                                        Log in
                                    </Link>
                                    <Link href={route('register')} className="welcome-page__nav-link welcome-page__nav-link--primary">
                                        Get started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <section className="welcome-page__hero">
                        <div className="welcome-page__hero-content">
                            <h1 className="welcome-page__headline">
                                Build momentum,<br />one habit at a time.
                            </h1>
                            <p className="welcome-page__subline">
                                Momentum helps you design, schedule and stick to the habits that matter — backed by proven behaviour science.
                            </p>
                            {!auth.user && (
                                <Link href={route('register')} className="welcome-page__cta">
                                    Start for free
                                </Link>
                            )}
                        </div>
                        <div className="welcome-page__hero-animation">
                            <Cubes
                                gridSize={12}
                                maxAngle={60}
                                radius={4}
                                borderStyle="1px solid rgba(156, 163, 175, 0.3)"
                                faceColor="transparent"
                                rippleColor="#8B6BAE"
                                rippleSpeed={1.5}
                                autoAnimate={false}
                                rippleOnClick={true}
                                cellGap={6}
                                colorPattern="m-shape"
                                primaryColor="#8B6BAE"
                                secondaryColor="#00E5AA"
                            />
                        </div>
                    </section>

                    <section className="welcome-page__features">
                        {features.map((f) => (
                            <Link key={f.title} href={f.href} className="welcome-page__card">
                                <span className="welcome-page__card-icon">{f.icon}</span>
                                <h2 className="welcome-page__card-title">{f.title}</h2>
                                <p className="welcome-page__card-body">{f.description}</p>
                                <span className="welcome-page__card-arrow">&rarr;</span>
                            </Link>
                        ))}
                    </section>
                </div>
            </div>
        </>
    );
}
