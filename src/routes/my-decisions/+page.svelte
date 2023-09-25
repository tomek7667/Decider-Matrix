<script lang="ts">
  import { onMount } from "svelte";
  import {
    clone,
    onMountHandler,
    pb,
    user,
    type MatrixRow,
    decryptMatrix,
  } from "$lib";
  import { goto } from "$app/navigation";
  import GoBackButton from "$lib/GoBackButton.svelte";
  import Decision from "./Decision.svelte";

  let isLoading = true;
  let decisions: MatrixRow[] = [];

  onMount(async () => {
    onMountHandler();
    if ($user === null) {
      goto("/login");
      return;
    }
    try {
      const unencryptedRecords = await pb.collection("matrices").getFullList({
        sort: "-updated",
      });
      const unencryptedDecisions = unencryptedRecords.map((record) => ({
        id: record.id,
        data: clone(record.data),
        updated: new Date(record.updated),
        created: new Date(record.created),
        isEncrypted: false,
      }));

      const encryptedRecords = await pb
        .collection("matrices_encrypted")
        .getFullList({
          sort: "-updated",
        });

      const encryptedDecisions = await Promise.all(
        encryptedRecords.map(async (record) => ({
          id: record.id,
          data: await decryptMatrix(record.data),
          updated: new Date(record.updated),
          created: new Date(record.created),
          isEncrypted: true,
        }))
      );

      decisions = [...unencryptedDecisions, ...encryptedDecisions].sort(
        (a, b) => b.updated.getTime() - a.updated.getTime()
      );
    } catch (err: any) {
      alert(err.message ?? err.toString());
      goto("/");
    }
    isLoading = false;
  });
</script>

<div class="hero">
  <div class="hero-body">
    <GoBackButton />
    <hr />
    <p class="title">Your decisions:</p>
    {#if isLoading}
      <div class="loader" />
    {:else if decisions.length === 0}
      <p class="subtitle">You have no decisions yet.</p>
    {:else}
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Best option</th>
            <th>Actions</th>
            <th>Is encrypted</th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Best option</th>
            <th>Actions</th>
            <th>Is encrypted</th>
          </tr>
        </tfoot>
        <tbody>
          {#each decisions as decision}
            <Decision row={decision} />
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
