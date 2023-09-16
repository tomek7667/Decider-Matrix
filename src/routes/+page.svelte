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
  import Manual from "./Manual.svelte";
  import { slide } from "svelte/transition";

  let isEditingVisible = true;

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

  const exportMatrixHandler = () => {
    const contents = JSON.stringify($decisionMatrix, null, 4);
    const link = document.createElement("a");
    const jsonContents = `data:text/json;charset=utf-8,${contents}`;
    const encodedUri = encodeURI(jsonContents);
    link.setAttribute("href", encodedUri);
    const filename = `${$decisionMatrix.name}_${Date.now()}.json`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
    <div class="buttons">
      {#if JSON.stringify($decisionMatrix) !== JSON.stringify(emptyMatrix)}
        <button class="button is-danger" on:click={clearMatrix}>
          Clear matrix
        </button>
        <button class="button is-success" on:click={exportMatrixHandler}
          >Export</button
        >
      {/if}
      <button class="button is-warning" on:click={importMatrixHandler}
        >Import</button
      >
    </div>
    <Manual />
    <hr />
    {#if isEditingVisible}
      <div transition:slide>
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
            <button class="button is-link" on:click={addItem}
              >Add new item</button
            >
          </div>
        </div>
      </div>
    {/if}
    <button
      class="button"
      on:click={() => (isEditingVisible = !isEditingVisible)}
      >{isEditingVisible ? "Hide" : "Show"} editing area</button
    >
    <hr />
    <div id="results">
      {#if $errorMessage !== ""}
        <ErrorMessage />
      {:else}
        <DecisionResult />
      {/if}
    </div>
  </div>
</div>
