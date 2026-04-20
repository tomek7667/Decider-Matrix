<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMountHandler, pb, symmetricKey, user } from "$lib";
  import { onMount } from "svelte";

  onMount(() => {
    onMountHandler();
    pb.authStore.clear();
    $user = null;
    $symmetricKey = null;
    goto("/");
  });
</script>

<main class="logout-page">
  <div class="logout-box">
    <div class="brand" style="justify-content: center; margin-bottom: 20px;">
      <span class="hex"></span>
      <span>DECIDER</span>
    </div>
    <p class="logout-title">Signing out…</p>
    <p class="logout-sub">
      Not redirected? <a href="/">Go home</a>
    </p>
  </div>
</main>
