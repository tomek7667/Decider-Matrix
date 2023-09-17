<script lang="ts">
  import { decisionMatrix } from "$lib";

  const importMatrixHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".json");
    input.addEventListener("change", (event: any) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const contents = event.target.result;
        if (!contents) {
          return;
        }
        const matrix = JSON.parse(contents);
        decisionMatrix.set(matrix);
      };
      reader.readAsText(file);
    });
    document.body.appendChild(input);
    input.click();
    input.remove();
  };
</script>

<button class="button is-warning" on:click={importMatrixHandler}>Import</button>
