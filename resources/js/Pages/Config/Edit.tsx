import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/shared/components/FlashMessage';
import { ConfigForm } from '@/features/config';
import type { UserConfig } from '@/features/config';
import { Head } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface Props extends PageProps {
    config: UserConfig;
}

export default function Edit({ config }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">Config</h2>
            }
        >
            <Head title="Config" />
            <FlashMessage />

            <div className="py-8">
                <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <ConfigForm config={config} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
