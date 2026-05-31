import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { CalendarViewToggle } from '@/shared/components/calendar';
import Icon from '@/shared/components/Icon';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

const HEADER_REVEAL_AT_TOP_PX = 80;
const SCROLL_DELTA_THRESHOLD = 6;

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Scroll-aware header: always visible near the top of the page; hides on
    // scroll-down past the reveal threshold; re-appears immediately on
    // scroll-up so the user can hit the cog/nav without going to the top.
    const [headerHidden, setHeaderHidden] = useState(false);
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            const dy = y - lastY;
            if (y < HEADER_REVEAL_AT_TOP_PX) {
                setHeaderHidden(false);
            } else if (dy > SCROLL_DELTA_THRESHOLD) {
                setHeaderHidden(true);
            } else if (dy < -SCROLL_DELTA_THRESHOLD) {
                setHeaderHidden(false);
            }
            lastY = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-9" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('daily')}
                                    active={route().current('daily')}
                                >
                                    Daily
                                </NavLink>
                                <NavLink
                                    href={route('weekly')}
                                    active={route().current('weekly')}
                                >
                                    Weekly
                                </NavLink>
                                <NavLink
                                    href={route('monthly')}
                                    active={route().current('monthly')}
                                >
                                    Monthly
                                </NavLink>
                                <NavLink
                                    href={route('stats')}
                                    active={route().current('stats')}
                                >
                                    Stats
                                </NavLink>
                                <NavLink
                                    href={route('config.edit')}
                                    active={route().current('config.edit')}
                                >
                                    Config
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.first_name}

                                                <Icon name="expand_more" size={16} className="-me-0.5 ms-2" aria-hidden />
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <CalendarViewToggle />
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <Icon
                                    name={showingNavigationDropdown ? 'close' : 'menu'}
                                    size={24}
                                    aria-hidden
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('daily')}
                            active={route().current('daily')}
                        >
                            Daily
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('weekly')}
                            active={route().current('weekly')}
                        >
                            Weekly
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('monthly')}
                            active={route().current('monthly')}
                        >
                            Monthly
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('stats')}
                            active={route().current('stats')}
                        >
                            Stats
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('config.edit')}
                            active={route().current('config.edit')}
                        >
                            Config
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.first_name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header
                    className={`sticky top-0 z-30 bg-white shadow transition-transform duration-200 ease-out ${headerHidden ? '-translate-y-full' : 'translate-y-0'}`}
                >
                    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 overflow-hidden">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
