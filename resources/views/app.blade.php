<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Momentum') }}</title>
    <meta name="description" content="Momentum — build lasting habits, track streaks, and stay consistent every day.">

    <!-- Favicon / App Icons -->
    <link rel="icon" type="image/png" href="/logo_75.png">
    <link rel="apple-touch-icon" href="/logo_75.png">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ config('app.name', 'Momentum') }}">
    <meta property="og:title" content="Momentum — Build Better Habits">
    <meta property="og:description"
        content="Track your habits, build streaks, and stay consistent every day with Momentum.">
    <meta property="og:image" content="{{ config('app.url') }}/logo_75.png">
    <meta property="og:url" content="{{ config('app.url') }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Momentum — Build Better Habits">
    <meta name="twitter:description"
        content="Track your habits, build streaks, and stay consistent every day with Momentum.">
    <meta name="twitter:image" content="{{ config('app.url') }}/logo_75.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

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
