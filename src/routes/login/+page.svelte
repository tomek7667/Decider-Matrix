<script lang="ts">
  import { onMount } from "svelte";
  import {
    createKey,
    deserializeUser,
    onMountHandler,
    pb,
    symmetricKey,
    user,
  } from "$lib";
  import { goto } from "$app/navigation";

  let isLoading = false;
  let username = "";
  let password = "";
  let theme: "dark" | "light" = "dark";

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("decider_theme", theme);
    } catch (_) {}
  }

  const loginHandler = async () => {
    isLoading = true;
    try {
      const response = await pb
        .collection("users")
        .authWithPassword(username, password);
      const { token, record } = response;
      pb.authStore.save(token);
      if (record) {
        $symmetricKey = await createKey(password);
        $user = deserializeUser(record);
        goto("/");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  onMount(() => {
    try {
      const saved = localStorage.getItem("decider_theme");
      if (saved === "light" || saved === "dark") {
        theme = saved as "dark" | "light";
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch (_) {}
    onMountHandler();
  });
</script>

<nav class="auth-nav">
  <a class="brand" href="/">
    <span class="hex"></span>
    <span>DECIDER</span>
  </a>
  <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
    <svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
    </svg>
    <svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</nav>

<main class="auth-page">
  <div class="auth-box">
    <h1 class="auth-title">Sign in</h1>
    <p class="auth-subtitle">Welcome back to Decider</p>

    <form on:submit|preventDefault={loginHandler}>
      <div class="form-field">
        <label class="form-label" for="username">Username or email</label>
        <input
          id="username"
          class="auth-input"
          type="text"
          placeholder="john123 or abc@example.com"
          bind:value={username}
          autocomplete="username"
          required
        />
      </div>
      <div class="form-field">
        <label class="form-label" for="password">Password</label>
        <input
          id="password"
          class="auth-input"
          type="password"
          placeholder="••••••••"
          bind:value={password}
          autocomplete="current-password"
          required
        />
      </div>
      <button class="auth-submit" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>

    <p class="auth-footer">
      No account yet? <a class="auth-link" href="/register">Create one</a>
    </p>
  </div>
</main>
