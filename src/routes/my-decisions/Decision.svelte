<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    type MatrixRow,
    clone,
    decisionMatrix,
    decisionMatrixId,
    pb,
    emptyMatrix,
    shouldEncrypt,
  } from "$lib";

  interface Result {
    name: string;
    total: number;
  }

  export let row: MatrixRow;

  let isLoading = false;
  let denominator = 0;
  let results: Result[] = [];

  const chooseDecisionHandler = () => {
    $decisionMatrix = clone(row.data);
    $decisionMatrixId = row.id;
    $shouldEncrypt = row.isEncrypted;
    goto("/");
  };

  const deleteButtonHandler = async () => {
    isLoading = true;
    try {
      if (confirm("Are you sure you want to delete this decision?")) {
        if (row.isEncrypted) {
          await pb.collection("matrices_encrypted").delete(row.id);
        } else {
          await pb.collection("matrices").delete(row.id);
        }
        $decisionMatrixId = null;
        $decisionMatrix = clone(emptyMatrix);
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const bestDecision = (): string => {
    try {
      const matrix = row.data;
      denominator = matrix.criterias.reduce(
        (acc, criteria) => acc + criteria.importance,
        0
      );
      results = matrix.items
        .map((item) => {
          const { name, criterias } = item;
          const nominator = criterias.reduce((acc, criteria) => {
            if (criteria.value === undefined) {
              return acc;
            }
            return acc + criteria.value * criteria.importance;
          }, 0);
          const total =
            Math.round((nominator / criterias.length) * 10000) / 10000;
          return {
            name,
            total,
          };
        })
        .sort((a, b) => b.total - a.total);
      return results[0]?.name ?? "-";
    } catch (err) {
      console.log("bestDecision", err);
      return "-";
    }
  };
</script>

<tr>
  <td>{row.data.name}</td>
  <td>{row.created.toLocaleString()}</td>
  <td>{row.updated.toLocaleString()}</td>
  <td><b>{bestDecision()}</b></td>
  <td>
    <div class="buttons">
      <button class="button" on:click={chooseDecisionHandler}>Visit</button>
      <button
        class="button is-danger {isLoading ? 'is-loading' : ''}"
        on:click={deleteButtonHandler}>Delete</button
      >
    </div>
  </td>
  <td>
    {row.isEncrypted ? "✅" : "❌"}
  </td>
</tr>
