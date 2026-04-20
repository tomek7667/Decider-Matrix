<script>
  import { onMount } from "svelte";
  import { onMountHandler, pb } from "$lib";
  import { goto } from "$app/navigation";

  let isLoading = false;
  let theme = "dark";

  const data = {
    username: "",
    email: "",
    emailVisibility: true,
    password: "",
    passwordConfirm: "",
    name: "",
  };

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("decider_theme", theme);
    } catch (_) {}
  }

  const registerHandler = async () => {
    isLoading = true;
    try {
      const record = await pb.collection("users").create(data);
      if (record) {
        goto("/login");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert(err?.message ?? String(err));
    }
    isLoading = false;
  };

  onMount(() => {
    try {
      const saved = localStorage.getItem("decider_theme");
      if (saved === "light" || saved === "dark") {
        theme = saved;
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
    <h1 class="auth-title">Create account</h1>
    <p class="auth-subtitle">Join Decider to save your decisions</p>

    <form on:submit|preventDefault={registerHandler}>
      <div class="form-field">
        <label class="form-label" for="username">Username</label>
        <input
          id="username"
          class="auth-input"
          type="text"
          placeholder="john123"
          bind:value={data.username}
          autocomplete="username"
          required
        />
      </div>
      <div class="form-field">
        <label class="form-label" for="name">Display name</label>
        <input
          id="name"
          class="auth-input"
          type="text"
          placeholder="John Doe"
          bind:value={data.name}
          autocomplete="name"
          required
        />
      </div>
      <div class="form-field">
        <label class="form-label" for="email">Email</label>
        <input
          id="email"
          class="auth-input"
          type="email"
          placeholder="abc@example.com"
          bind:value={data.email}
          autocomplete="email"
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
          bind:value={data.password}
          autocomplete="new-password"
          required
        />
      </div>
      <div class="form-field">
        <label class="form-label" for="passwordConfirm">Confirm password</label>
        <input
          id="passwordConfirm"
          class="auth-input"
          type="password"
          placeholder="••••••••"
          bind:value={data.passwordConfirm}
          autocomplete="new-password"
          required
        />
      </div>
      <button class="auth-submit" type="submit" disabled={isLoading}>
        {isLoading ? "Creating account…" : "Create account"}
      </button>
    </form>

    <p class="auth-footer">
      Already have an account? <a class="auth-link" href="/login">Sign in</a>
    </p>
  </div>
</main>
