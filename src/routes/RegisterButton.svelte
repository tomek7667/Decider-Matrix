<script lang="ts">
  import { goto } from "$app/navigation";

  const registerButtonHandler = () => {
    goto("/register");
  };
</script>

<button class="button" on:click={registerButtonHandler}> Register </button>
