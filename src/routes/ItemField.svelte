<script lang="ts">
  import { decisionMatrix, type Item } from "$lib";

  export let item: Item;
  export let index: number;

  const updateName = (index: number, item: Item) => {
    decisionMatrix.update((matrix) => {
      matrix.items[index].name = item.name;
      return matrix;
    });
  };

  const deleteItem = (index: number) => {
    decisionMatrix.update((matrix) => {
      matrix.items.splice(index, 1);
      return matrix;
    });
  };

  const updateCriteriaValue = (
    criteriaIndex: number,
    value: number | undefined
  ) => {
    decisionMatrix.update((matrix) => {
      matrix.items[index].criterias[criteriaIndex].value = value;
      return matrix;
    });
  };
</script>

<div class="card">
  <div class="card-content">
    <input
      class="input"
      type="text"
      placeholder="Considered option"
      bind:value={item.name}
      on:input={() => updateName(index, item)}
    />
    <hr />
    <div>
      {#each item.criterias as criteria, i}
        <div class="columns">
          <div class="column criteriaNameBox">
            <p>
              {criteria.name.length > 0 ? criteria.name : "Unnamed criteria"}
            </p>
          </div>
          <div class="column criteriaValueBox">
            <input
              class="input"
              type="number"
              bind:value={criteria.value}
              on:input={() => updateCriteriaValue(i, criteria.value)}
            />
          </div>
        </div>
      {/each}
    </div>
    <hr />
    <button class="button is-danger" on:click={() => deleteItem(index)}
      >Delete</button
    >
  </div>
</div>
<br />

<style>
  .criteriaNameBox {
    max-width: 65%;
    text-wrap: wrap;
  }

  .criteriaValueBox {
    max-width: 35%;
  }
</style>
