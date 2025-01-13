<script>
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import Header from '$lib/components/header.svelte';

    const profile = './h4ck0rLogo.png';

    // Typing Animation for Heading
    let headingText = 'Welcome to SecRush';
    let displayedHeading = '';
    let typing = true;

    onMount(() => {
        let index = 0;
        const typingSpeed = 100; // milliseconds per character

        const typeInterval = setInterval(() => {
            if (index < headingText.length) {
                displayedHeading += headingText.charAt(index);
                index++;
            } else {
                clearInterval(typeInterval);
                typing = false;
            }
        }, typingSpeed);

        return () => clearInterval(typeInterval);
    });
</script>

<style>
    /* Text Glow Effect */
    

    /* Blinking Cursor */
    .blinking-cursor {
        display: inline-block;
        width: 10px;
        background-color: currentColor;
        animation: blink 1s steps(1) infinite;
        margin-left: 2px;
    }

    @keyframes blink {
        0%, 50% {
            opacity: 1;
        }
        51%, 100% {
            opacity: 0;
        }
    }

    /* Terminal Grid Overlay */
    .terminal-overlay {
        background-image:
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none; /* Allows interactions with underlying elements */
    }

</style>

<div class='border-b border-white'>
    <Header />
</div>


<!-- Hero Section -->
<div 
    class="hero-container h-screen w-full bg-black flex flex-col items-center space-y-6 justify-center relative overflow-hidden text-center px-4 md:px-8"
    transition:fade
>
    <!-- Terminal Grid Overlay -->
    <div class="terminal-overlay absolute inset-0"></div>

    <!-- Content Wrapper -->
    <div class="relative z-10 max-w-4xl mx-auto">
        <!-- Hero Heading with Typing Animation -->
        <h1 class="text-3xl md:text-6xl font-bold text-white font-mono text-glow">
            &gt;
            {#if typing}
                {displayedHeading}
                <span class="blinking-cursor">|</span>
            {:else}
                {headingText}
            {/if}
        </h1>

        <!-- Hero Subheading -->
        <p class="text-lg md:text-2xl text-white font-mono text-glow max-w-2xl">
            Programmers make mistakes. Vulnerable code exists everywhere. Can you identify where they've f**** up?
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col py-20 md:flex-row gap-4 items-center justify-center">
            <a
                href="/rush"
                class="border font-mono border-white hover:bg-white text-white hover:text-black cursor-pointer transition duration-150 ease-in-out transform  flex items-center justify-center w-full md:w-1/2 py-4 text-xl lowercase rounded-2xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white"
                tabindex="0"
            >
                Start Puzzle
            </a>

            <a
                href="https://discord.gg/tZHjJNFsez"
                class="border font-mono border-white hover:bg-white text-white hover:text-black cursor-pointer transition duration-150 ease-in-out transform  flex items-center justify-center w-full md:w-1/2 py-4 text-xl lowercase rounded-2xl shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white"
                tabindex="0"
            >
                Join Discord
            </a>
        </div>
    </div>
</div>
