<script lang="ts">
  import { decisionMatrixId, decisionMatrix, pb, user } from "$lib";

  let isLoading = false;

  const saveButtonHandler = async () => {
    isLoading = true;
    try {
      if (!$user) {
        throw new Error("You need to be logged in to save a matrix");
      }
      if ($decisionMatrixId) {
        const updateData = {
          data: $decisionMatrix,
        };
        const record = await pb
          .collection("matrices")
          .update($decisionMatrixId, updateData);
        const { id, data } = record;
        decisionMatrixId.set(id);
        decisionMatrix.set(data);
      } else {
        const createData = {
          data: $decisionMatrix,
          user: $user.id,
        };
        const record = await pb.collection("matrices").create(createData);
        const { id, data } = record;
        decisionMatrixId.set(id);
        decisionMatrix.set(data);
      }
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };
</script>

<button
  class="button is-success {isLoading ? 'is-loading' : ''}"
  on:click={saveButtonHandler}>Save</button
>
