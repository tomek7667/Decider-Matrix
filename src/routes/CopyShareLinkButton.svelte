<script lang="ts">
  import { decisionMatrixId } from "$lib";

  const copyLinkToShareButtonHandler = () => {
    const url = `${document.URL}?share=${$decisionMatrixId}`;
    navigator.clipboard.writeText(url);
  };
</script>

<button class="button" on:click={copyLinkToShareButtonHandler}
  >Copy link to share</button
>
