<script lang="ts">
  import { type Criteria, decisionMatrix } from "$lib";

  export let criteria: Criteria;
  export let index: number;

  const deleteCriteria = (index: number) => {
    decisionMatrix.update((matrix) => {
      matrix.criterias.splice(index, 1);
      matrix.items.forEach((item) => {
        item.criterias.splice(index, 1);
      });
      return matrix;
    });
  };

  const updateCriteria = (index: number, criteria: Criteria) => {
    decisionMatrix.update((matrix) => {
      matrix.criterias[index] = criteria;
      matrix.items.forEach((item) => {
        item.criterias[index].name = criteria.name;
        item.criterias[index].importance = criteria.importance;
      });
      return matrix;
    });
  };
</script>

<div class="card">
  <div class="card-content">
    <div class="columns">
      <div class="column">
        <p>Criteria name</p>
        <input
          class="input"
          type="text"
          placeholder="Criteria name"
          bind:value={criteria.name}
          on:input={() => updateCriteria(index, criteria)}
        />
      </div>
      <div class="column">
        <p>Importance</p>
        <input
          class="input"
          type="number"
          placeholder="Criteria importance"
          min="0"
          bind:value={criteria.importance}
          on:input={() => updateCriteria(index, criteria)}
        />
      </div>
    </div>
    <button class="button is-danger" on:click={() => deleteCriteria(index)}
      >Delete</button
    >
  </div>
</div>
<br />
