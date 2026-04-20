<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "$lib";

  export let title: string = "";
  export let backHref: string = "/";

  let theme: "dark" | "light" = "dark";

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("decider_theme", theme);
    } catch (_) {}
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem("decider_theme");
      if (saved === "light" || saved === "dark") {
        theme = saved as "dark" | "light";
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch (_) {}
  });
</script>

<nav class="sub-nav">
  <button class="sub-nav-back" on:click={() => goto(backHref)}>
    ← Back
  </button>
  {#if title}
    <span class="sub-nav-sep">/</span>
    <span class="sub-nav-title">{title}</span>
  {/if}
  <div class="sub-nav-right">
    <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
      <svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
      </svg>
      <svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
    {#if $user}
      <span class="avatar">{$user.username[0].toUpperCase()}</span>
    {/if}
  </div>
</nav>
