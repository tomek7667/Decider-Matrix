<script lang="ts">
  import { goto } from "$app/navigation";

  const yourDecisionsButtonHandler = () => {
    goto("/my-decisions");
  };
</script>

<button class="button" on:click={yourDecisionsButtonHandler}
  >Your decisions</button
>
