<script lang="ts">
  import { decisionMatrix } from "$lib";

  const exportMatrixHandler = () => {
    const contents = JSON.stringify($decisionMatrix, null, 4);
    const link = document.createElement("a");
    const jsonContents = `data:text/json;charset=utf-8,${contents}`;
    const encodedUri = encodeURI(jsonContents);
    link.setAttribute("href", encodedUri);
    const filename = `${$decisionMatrix.name}_${Date.now()}.json`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
</script>

<button class="button is-warning" on:click={exportMatrixHandler}>Export</button>
