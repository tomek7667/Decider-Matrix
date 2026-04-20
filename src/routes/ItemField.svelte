<script lang="ts">
  import { decisionMatrix, type Item } from "$lib";

  export let item: Item;
  export let index: number;
  export let isTop: boolean = false;

  const updateName = (i: number, it: Item) => {
    decisionMatrix.update((matrix) => {
      matrix.items[i].name = it.name;
      return matrix;
    });
  };

  const deleteItem = (i: number) => {
    decisionMatrix.update((matrix) => {
      matrix.items.splice(i, 1);
      return matrix;
    });
  };

  const updateCriteriaValue = (criteriaIndex: number, value: number | undefined) => {
    decisionMatrix.update((matrix) => {
      matrix.items[index].criterias[criteriaIndex].value = value;
      return matrix;
    });
  };
</script>

<div class="item-block" class:is-top={isTop}>
  <div class="item-block-head">
    <input
      class="item-name-input"
      type="text"
      placeholder="Option name"
      bind:value={item.name}
      on:input={() => updateName(index, item)}
    />
    <button class="ghost-x" title="Delete option" on:click={() => deleteItem(index)}>
      ×
    </button>
  </div>
  <div class="criteria-grid">
    {#if item.criterias.length === 0}
      <div class="criteria-name is-empty" style="padding: 6px 0">
        Add criteria to score this option.
      </div>
    {:else}
      {#each item.criterias as criteria, i}
        <div class="criteria-value-row">
          <span class="criteria-name" class:is-empty={!criteria.name}>
            {criteria.name || "Unnamed criterion"}
            <span class="weight-hint">w{criteria.importance}</span>
          </span>
          <input
            class="value-input"
            class:is-missing={criteria.value === undefined || criteria.value === null}
            type="number"
            min="0"
            max="10"
            bind:value={criteria.value}
            placeholder="–"
            on:input={() => updateCriteriaValue(i, criteria.value)}
          />
        </div>
      {/each}
    {/if}
  </div>
</div>
