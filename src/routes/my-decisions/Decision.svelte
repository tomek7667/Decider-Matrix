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

  export let row: MatrixRow;

  let isLoading = false;

  const chooseDecisionHandler = () => {
    $decisionMatrix = clone(row.data);
    $decisionMatrixId = row.id;
    $shouldEncrypt = row.isEncrypted;
    goto("/");
  };

  const deleteButtonHandler = async () => {
    if (!confirm("Delete this decision? This cannot be undone.")) return;
    isLoading = true;
    try {
      if (row.isEncrypted) {
        await pb.collection("matrices_encrypted").delete(row.id);
      } else {
        await pb.collection("matrices").delete(row.id);
      }
      $decisionMatrixId = null;
      $decisionMatrix = clone(emptyMatrix);
      window.location.reload();
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const bestOption = (): string => {
    try {
      const items = row.data.items;
      if (!items.length) return "—";
      const n = row.data.criterias.length || 1;
      const ranked = items
        .map((item) => {
          const sum = item.criterias.reduce((acc, c) => {
            return c.value !== undefined ? acc + c.value * c.importance : acc;
          }, 0);
          return { name: item.name, score: Math.round((sum / n) * 10000) / 10000 };
        })
        .sort((a, b) => b.score - a.score);
      return ranked[0]?.name || "—";
    } catch {
      return "—";
    }
  };
</script>

<div class="decision-card">
  <div class="decision-card-name" title={row.data.name}>{row.data.name}</div>

  <div class="decision-card-best">
    <span class="best-label">Best</span>
    <span class="best-value">{bestOption()}</span>
  </div>

  <div class="decision-card-meta">
    <span>Created {row.created.toLocaleDateString()}</span>
    <span>Updated {row.updated.toLocaleDateString()}</span>
    <span>{row.data.criterias.length} criteria · {row.data.items.length} options</span>
  </div>

  <div class="decision-card-footer">
    <span class="badge" class:is-encrypted={row.isEncrypted}>
      {row.isEncrypted ? "🔒 Encrypted" : "Plaintext"}
    </span>
    <div class="card-actions">
      <button class="btn btn-ghost" on:click={chooseDecisionHandler}>Open</button>
      <button
        class="btn btn-danger btn-ghost"
        class:btn-loading={isLoading}
        on:click={deleteButtonHandler}
      >
        Delete
      </button>
    </div>
  </div>
</div>
