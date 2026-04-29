export default function ApplicationLogo({ className }: { className?: string }) {
    return (
        <img
            src="/logo.png"
            alt="Momentum"
            className={className}
        />
    );
}
