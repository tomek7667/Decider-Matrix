<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMountHandler, pb, user } from "$lib";
  import { onMount } from "svelte";

  onMount(() => {
    onMountHandler();
    pb.authStore.clear();
    $user = null;
    goto("/");
  });
</script>

<div class="hero">
  <div class="hero-body">
    <p class="title">Logging out...</p>
    <a href="/">If you are not redirected, click here.</a>
  </div>
</div>
