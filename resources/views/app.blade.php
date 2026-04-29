<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Momentum') }}{{ config('app.version') ? ' v' . config('app.version') : '' }}
    </title>
    <meta name="description" content="Momentum — build lasting habits, track streaks, and stay consistent every day.">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#604C81">
    <link rel="canonical" href="{{ config('app.url') }}">

    <!-- Favicon / App Icons -->
    <link rel="icon" type="image/png" href="/logo.png">
    <link rel="apple-touch-icon" href="/logo.png">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ config('app.name', 'Momentum') }}">
    <meta property="og:title" content="Momentum — Your Journey, one moment at a time">
    <meta property="og:description"
        content="Track your habits, build streaks, and stay consistent every day with Momentum.">
    <meta property="og:image" content="{{ config('app.url') }}/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/png">
    <meta property="og:url" content="{{ config('app.url') }}">
    <meta property="og:locale" content="es_ES">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Momentum — Build Better Habits">
    <meta name="twitter:description"
        content="Track your habits, build streaks, and stay consitent, one moment at a time">
    <meta name="twitter:image" content="{{ config('app.url') }}/og-image.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,600;0,900;1,200&amp;display=swap"
        rel="stylesheet">
    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
