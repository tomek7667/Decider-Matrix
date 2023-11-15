<script lang="ts">
  import { onMount } from "svelte";
  import {
    decisionMatrix,
    errorMessage,
    clone,
    emptyMatrix,
    user,
    onMountHandler,
    pb,
    decisionMatrixId,
  } from "$lib";
  import DecisionTitle from "./DecisionTitle.svelte";
  import CriteriaField from "./CriteriaField.svelte";
  import DecisionResult from "./DecisionResult.svelte";
  import ErrorMessage from "./ErrorMessage.svelte";
  import ItemField from "./ItemField.svelte";
  import Manual from "./Manual.svelte";
  import { slide } from "svelte/transition";
  import LoginButton from "./LoginButton.svelte";
  import RegisterButton from "./RegisterButton.svelte";
  import LogoutButton from "./LogoutButton.svelte";
  import YourDecisionsButton from "./YourDecisionsButton.svelte";
  import SaveButton from "./SaveButton.svelte";
  import ClearMatrixButton from "./ClearMatrixButton.svelte";
  import ExportMatrixButton from "./ExportMatrixButton.svelte";
  import ImportMatrixButton from "./ImportMatrixButton.svelte";
  import ChatsButton from "./ChatsButton.svelte";
  import EncryptSwitch from "./EncryptSwitch.svelte";
  import ShareButton from "./ShareButton.svelte";
  import CopyShareLinkButton from "./CopyShareLinkButton.svelte";

  let isEditingVisible = true;

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
        criterias: clone(matrix.criterias),
      });
      return matrix;
    });
  };

  onMount(() => {
    onMountHandler(async () => {
      const params = window.location.search;
      const urlParams = new URLSearchParams(params);
      const share = urlParams.get("share");
      if (share) {
        const record = await pb.collection("matrices").getOne(share);
        if (record) {
          const { id, data, isShared, user } = record;
          console.log(record);
          decisionMatrixId.set(id);
          decisionMatrix.set({
            ...data,
            isShared,
            isEncrypted: false,
            userId: user,
          });
        }
      }
    });
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
      {#if $user === null}
        <LoginButton />
        <RegisterButton />
      {:else}
        <LogoutButton />
        <YourDecisionsButton />
        <ChatsButton />
      {/if}
    </div>
    <div class="buttons">
      {#if JSON.stringify($decisionMatrix) !== JSON.stringify(emptyMatrix)}
        <button
          class="button"
          on:click={() => (isEditingVisible = !isEditingVisible)}
          >{isEditingVisible ? "Hide" : "Show"} editing area</button
        >
        {#if $user !== null}
          <EncryptSwitch />
          <SaveButton />
          {#if !$decisionMatrix.isEncrypted}
            <ShareButton />
            {#if $decisionMatrix.isShared}
              <CopyShareLinkButton />
            {/if}
          {/if}
        {/if}
        <ClearMatrixButton />
        <ExportMatrixButton />
      {/if}
      <ImportMatrixButton />
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
    <br />
    <div class="buttons">
      <button
        class="button"
        on:click={() => (isEditingVisible = !isEditingVisible)}
        >{isEditingVisible ? "Hide" : "Show"} editing area</button
      >
      {#if $user !== null}
        <EncryptSwitch />
        <SaveButton />
        {#if !$decisionMatrix.isEncrypted}
          <ShareButton />
          {#if $decisionMatrix.isShared}
            <CopyShareLinkButton />
          {/if}
        {/if}
      {/if}
    </div>
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
