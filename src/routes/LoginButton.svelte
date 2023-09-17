<script lang="ts">
  import { goto } from "$app/navigation";

  const loginButtonHandler = () => {
    goto("/login");
  };
</script>

<button class="button is-success" on:click={loginButtonHandler}> Login </button>
