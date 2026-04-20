<script lang="ts">
  import { onMount } from "svelte";
  import { clone, onMountHandler, pb, user, type MatrixRow, decryptMatrix } from "$lib";
  import { goto } from "$app/navigation";
  import SubNav from "../SubNav.svelte";
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
      const unencryptedDecisions: MatrixRow[] = unencryptedRecords.map((record) => ({
        id: record.id,
        data: clone(record.data),
        updated: new Date(record.updated),
        created: new Date(record.created),
        isShared: record.isShared ?? false,
        isEncrypted: false,
      }));

      const encryptedRecords = await pb
        .collection("matrices_encrypted")
        .getFullList({ sort: "-updated" });

      const encryptedDecisions: MatrixRow[] = await Promise.all(
        encryptedRecords.map(async (record) => ({
          id: record.id,
          data: await decryptMatrix(record.data),
          updated: new Date(record.updated),
          created: new Date(record.created),
          isShared: false,
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

<SubNav title="MY DECISIONS" backHref="/" />

<div class="page-content">
  <div class="page-header">
    <h1 class="page-heading">Your decisions</h1>
    <button class="btn btn-primary" on:click={() => goto("/")}>
      + New decision
    </button>
  </div>

  {#if isLoading}
    <div class="spin-wrap"><div class="spinner"></div></div>
  {:else if decisions.length === 0}
    <div class="empty-state" style="padding: 64px 0">
      <div class="ring" style="width: 40px; height: 40px; margin-bottom: 20px;"></div>
      <div class="msg" style="font-size: 15px; margin-bottom: 20px;">No saved decisions yet.</div>
      <button class="btn btn-primary" on:click={() => goto("/")}>Create your first decision</button>
    </div>
  {:else}
    <div class="decisions-grid">
      {#each decisions as row}
        <Decision {row} />
      {/each}
    </div>
  {/if}
</div>
