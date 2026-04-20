<script lang="ts">
  import { type Criteria, decisionMatrix } from "$lib";

  export let criteria: Criteria;
  export let index: number;

  const deleteCriteria = (i: number) => {
    decisionMatrix.update((matrix) => {
      matrix.criterias.splice(i, 1);
      matrix.items.forEach((item) => {
        item.criterias.splice(i, 1);
      });
      return matrix;
    });
  };

  const updateCriteria = (i: number, c: Criteria) => {
    decisionMatrix.update((matrix) => {
      matrix.criterias[i] = c;
      matrix.items.forEach((item) => {
        item.criterias[i].name = c.name;
        item.criterias[i].importance = c.importance;
      });
      return matrix;
    });
  };
</script>

<div class="criteria-row">
  <span class="drag-handle" aria-hidden="true">⠿</span>
  <input
    class="inline-input"
    type="text"
    placeholder="Criterion name"
    bind:value={criteria.name}
    on:input={() => updateCriteria(index, criteria)}
  />
  <input
    class="weight-input"
    type="number"
    min="0"
    max="100"
    bind:value={criteria.importance}
    on:input={() => updateCriteria(index, criteria)}
    aria-label="Importance weight"
  />
  <button class="ghost-x" title="Delete criterion" on:click={() => deleteCriteria(index)}>
    ×
  </button>
</div>
