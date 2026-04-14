import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/shared/components/FlashMessage';
import { ConfigForm } from '@/features/config';
import type { UserConfig } from '@/features/config';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    config: UserConfig;
}

export default function Edit({ config }: Props) {
    const { appVersion } = usePage<PageProps>().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Config
                    {appVersion && (
                        <span className="ml-2 text-sm font-normal text-gray-400">v{appVersion}</span>
                    )}
                </h2>
            }
        >
            <Head title={`Config${appVersion ? ` v${appVersion}` : ''}`} />
            <FlashMessage />

            <div className="py-8">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="mm-form-card bg-white p-6 shadow-sm">
                        <ConfigForm config={config} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
