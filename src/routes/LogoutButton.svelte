<script lang="ts">
  import { goto } from "$app/navigation";

  const logoutButtonHandler = async () => {
    goto("/logout");
  };
</script>

<button class="button is-danger" on:click={logoutButtonHandler}>
  Logout
</button>
