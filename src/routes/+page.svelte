<script lang="ts">
  import { onMount } from "svelte";
  import {
    decisionMatrix,
    clearMatrix,
    errorMessage,
    clone,
    emptyMatrix
  } from "$lib";
  import DecisionTitle from "./DecisionTitle.svelte";
  import CriteriaField from "./CriteriaField.svelte";
  import DecisionResult from "./DecisionResult.svelte";
  import ErrorMessage from "./ErrorMessage.svelte";
  import ItemField from "./ItemField.svelte";

  const subscribe = () => {
    decisionMatrix.subscribe((matrix) => {
      window.localStorage.setItem("decisionMatrix", JSON.stringify(matrix));
    });
  };

  const addCriteria = () => {
    decisionMatrix.update((matrix) => {
      matrix.criterias.push({ name: "", importance: 0 });
      matrix.items.forEach((item) => {
        item.criterias.push({ name: "", value: undefined, importance: 0 });
      });
      return matrix;
    });
  };

  const addItem = () => {
    decisionMatrix.update((matrix) => {
      matrix.items.push({
        name: "",
        criterias: clone(matrix.criterias)
      });
      return matrix;
    });
  };

  onMount(() => {
    const _decisionMatrix = window.localStorage.getItem("decisionMatrix");
    if (_decisionMatrix) {
      decisionMatrix.set(JSON.parse(_decisionMatrix));
    } else {
      clearMatrix();
    }
    subscribe();
  });

  $: (() => {
    let _errors = [];
    if ($decisionMatrix.criterias.length === 0) {
      _errors.push("you need to add at least one criteria");
    }

    if ($decisionMatrix.items.length === 0) {
      _errors.push("you need to add at least one item");
    }

    if ($decisionMatrix.criterias.some((criteria) => criteria.name === "")) {
      _errors.push("criteria name(s) cannot be empty");
    }

    if ($decisionMatrix.items.some((item) => item.name === "")) {
      _errors.push("item name(s) cannot be empty");
    }

    $decisionMatrix.items.forEach((item) => {
      item.criterias.forEach((criteria) => {
        const isCriteriaItemEmpty =
          criteria.value === undefined || criteria.value === null;
        const isItemCriteriaNamesEmpty =
          criteria.name === "" || item.name === "";
        if (isCriteriaItemEmpty && !isItemCriteriaNamesEmpty) {
          _errors.push(
            `you need to add a value ${criteria.name} for ${item.name}`
          );
        }
      });
    });

    if (_errors.length > 0) {
      const message = _errors.join(", ");
      const capitalizedMessage =
        message.charAt(0).toUpperCase() + message.slice(1) + ".";
      errorMessage.set(capitalizedMessage);
    } else {
      errorMessage.set("");
    }
  })();
</script>

<div class="hero">
  <div class="hero-body">
    <p class="title">Decider Matrix</p>
    <p class="subtitle">Helps you on deciding on important life decisions</p>
    {#if JSON.stringify($decisionMatrix) !== JSON.stringify(emptyMatrix)}
      <button class="button is-danger" on:click={clearMatrix}>
        Clear matrix
      </button>
    {/if}
    <hr />
    <div>
      <DecisionTitle />
      <br />
      <div class="columns">
        <div class="column">
          {#each $decisionMatrix.criterias as criteria, index}
            <CriteriaField {criteria} {index} />
          {/each}
          <br />
          <button class="button is-link" on:click={addCriteria}
            >Add new criteria</button
          >
        </div>
        <div class="column">
          {#each $decisionMatrix.items as item, index}
            <ItemField {item} {index} />
          {/each}
          <br />
          <button class="button is-link" on:click={addItem}>Add new item</button
          >
        </div>
      </div>
    </div>
    <hr />
    {#if $errorMessage !== ""}
      <ErrorMessage />
    {:else}
      <DecisionResult />
    {/if}
  </div>
</div>
