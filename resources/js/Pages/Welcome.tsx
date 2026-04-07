import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

const features = [
    {
        icon: '??',
        title: 'Weekly View',
        description: 'See your entire week at a glance. Every moment, every slot, colour-coded by status.',
    },
    {
        icon: '?',
        title: 'Daily Schedule',
        description: "Your day laid out in 30-minute slots from wake to sleep. Know exactly what's next.",
    },
    {
        icon: '??',
        title: 'Dashboard',
        description: 'Track completion rates, streaks, and consistency across all your moments over time.',
    },
    {
        icon: '??',
        title: 'Moment Builder',
        description: 'Define habits with cues, stacks, environment prompts and rewards — the full system.',
    },
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Momentum — Build better habits" />

            <div className="welcome-page">
                <div className="welcome-page__glow" aria-hidden />

                <div className="welcome-page__inner">
                    <header className="welcome-page__header">
                        <img src="/logo_75.png" alt="Momentum" className="welcome-page__logo" />
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
                    </section>

                    <section className="welcome-page__features">
                        {features.map((f) => (
                            <div key={f.title} className="welcome-page__card">
                                <span className="welcome-page__card-icon">{f.icon}</span>
                                <h2 className="welcome-page__card-title">{f.title}</h2>
                                <p className="welcome-page__card-body">{f.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </>
    );
}
