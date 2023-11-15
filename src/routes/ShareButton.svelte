<script lang="ts">
  import { decisionMatrixId, decisionMatrix, pb } from "$lib";
  import { onMount } from "svelte";

  let isLoading = false;
  let buttonText: string;

  const shareButtonHandler = async (_isShared: boolean) => {
    isLoading = true;
    try {
      if (!$decisionMatrixId) {
        return;
      }

      const data = {
        isShared: _isShared,
      };
      const record = await pb
        .collection("matrices")
        .update($decisionMatrixId, data);
      if (record) {
        const { id, data, isShared, user } = record;
        decisionMatrixId.set(id);
        decisionMatrix.set({
          ...data,
          isShared,
          isEncrypted: false,
          userId: user,
        });
        if (isShared) {
          buttonText = "Un-share";
        } else {
          buttonText = "Share";
        }
      }
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  onMount(() => {
    buttonText = $decisionMatrix.isShared ? "Un-share" : "Share";
  });

  decisionMatrix.subscribe((matrix) => {
    buttonText = matrix.isShared ? "Un-share" : "Share";
  });
</script>

<button
  class="button is-link"
  on:click={() => shareButtonHandler(!$decisionMatrix.isShared)}
>
  {buttonText}
</button>
