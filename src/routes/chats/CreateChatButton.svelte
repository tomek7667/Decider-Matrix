<script lang="ts">
  import { goto } from "$app/navigation";

  const chatsButtonHandler = () => {
    goto("/chats/create");
  };
</script>

<button class="button" on:click={chatsButtonHandler}>Create chat</button>
