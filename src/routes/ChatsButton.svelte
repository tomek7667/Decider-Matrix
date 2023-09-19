<script lang="ts">
  import { goto } from "$app/navigation";

  const chatsButtonHandler = () => {
    goto("/chats");
  };
</script>

<button class="button" on:click={chatsButtonHandler}>Chats</button>
