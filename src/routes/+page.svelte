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
    shouldEncrypt,
    symmetricKey,
    encryptWithKey,
    decryptMatrix,
    clearMatrix,
  } from "$lib";
  import CriteriaField from "./CriteriaField.svelte";
  import ItemField from "./ItemField.svelte";
  import DecisionResult from "./DecisionResult.svelte";
  import { goto } from "$app/navigation";

  // Theme
  let theme: "dark" | "light" = "dark";
  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("decider_theme", theme);
    } catch (_) {}
  }

  // Mobile tabs
  let activeTab: "criteria" | "options" | "results" = "criteria";

  // Add criteria / options
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
      matrix.items.push({ name: "", criterias: clone(matrix.criterias) });
      return matrix;
    });
  };

  // Scoring for is-top highlight
  interface ScoreEntry {
    name: string;
    total: number;
  }
  let _scores: ScoreEntry[] = [];
  $: {
    const n = Math.max($decisionMatrix.criterias.length, 1);
    _scores = $decisionMatrix.items
      .map((item) => {
        let sum = 0;
        item.criterias.forEach((c) => {
          if (c.value !== undefined && c.value !== null) {
            sum += (c.value as number) * c.importance;
          }
        });
        return { name: item.name, total: Math.round((sum / n) * 10000) / 10000 };
      })
      .sort((a, b) => b.total - a.total);
  }
  $: topItemName = _scores[0]?.name ?? null;

  // Save
  let isSaving = false;
  const saveHandler = async () => {
    if (!$user) return;
    isSaving = true;
    try {
      if ($shouldEncrypt) {
        await doEncryptedSave();
      } else {
        await doUnencryptedSave();
      }
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isSaving = false;
  };

  const doUnencryptedSave = async () => {
    if (!$user) throw new Error("You need to be logged in to save a matrix");
    if ($decisionMatrixId) {
      try {
        const record = await pb
          .collection("matrices")
          .update($decisionMatrixId, { data: $decisionMatrix });
        const { id, data, isShared, user: userId } = record;
        decisionMatrixId.set(id);
        decisionMatrix.set({ ...data, isEncrypted: false, isShared, userId });
      } catch (err: any) {
        if (err.message === `The requested resource wasn't found.`) {
          const record = await pb
            .collection("matrices")
            .create({ data: $decisionMatrix, user: $user.id, isShared: false });
          const { id, data, isShared } = record;
          decisionMatrixId.set(id);
          decisionMatrix.set({ ...data, isEncrypted: false, isShared, userId: $user.id });
        } else {
          throw err;
        }
      }
    } else {
      const record = await pb
        .collection("matrices")
        .create({ data: $decisionMatrix, user: $user.id });
      const { id, data, isShared } = record;
      decisionMatrixId.set(id);
      decisionMatrix.set({ ...data, isEncrypted: false, isShared, userId: $user.id });
    }
  };

  const doEncryptedSave = async () => {
    if (!$user) throw new Error("You need to be logged in to save a matrix");
    if (!$symmetricKey)
      throw new Error("Please log out and log in again. Symmetric key missing.");
    const encryptedMatrix = await encryptWithKey(
      JSON.stringify($decisionMatrix),
      $symmetricKey
    );
    if ($decisionMatrixId) {
      try {
        const record = await pb
          .collection("matrices_encrypted")
          .update($decisionMatrixId, { data: encryptedMatrix });
        const { id, data, isShared } = record;
        const matrix = await decryptMatrix(data);
        decisionMatrixId.set(id);
        decisionMatrix.set({ ...matrix, isEncrypted: true, isShared, userId: $user.id });
      } catch (err: any) {
        if (err.message === `The requested resource wasn't found.`) {
          const record = await pb
            .collection("matrices_encrypted")
            .create({ data: encryptedMatrix, user: $user.id });
          const { id, data, isShared } = record;
          const matrix = await decryptMatrix(data);
          decisionMatrixId.set(id);
          decisionMatrix.set({ ...matrix, isEncrypted: true, isShared, userId: $user.id });
        } else {
          throw err;
        }
      }
    } else {
      const record = await pb
        .collection("matrices_encrypted")
        .create({ data: encryptedMatrix, user: $user.id });
      const { id, data, isShared } = record;
      const matrix = await decryptMatrix(data);
      decisionMatrixId.set(id);
      decisionMatrix.set({ ...matrix, isEncrypted: true, isShared, userId: $user.id });
    }
  };

  // Share
  let isSharing = false;
  const shareHandler = async () => {
    if (!$decisionMatrixId || !$user) return;
    isSharing = true;
    try {
      const newShared = !$decisionMatrix.isShared;
      const record = await pb
        .collection("matrices")
        .update($decisionMatrixId, { isShared: newShared });
      if (record) {
        const { id, data, isShared, user: userId } = record;
        decisionMatrixId.set(id);
        decisionMatrix.set({ ...data, isShared, isEncrypted: false, userId });
      }
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isSharing = false;
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/?share=${$decisionMatrixId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => alert("Share link copied!"))
      .catch(() => alert("Failed to copy link"));
  };

  // Export / Import
  const exportMatrix = () => {
    const contents = JSON.stringify($decisionMatrix, null, 4);
    const link = document.createElement("a");
    link.setAttribute(
      "href",
      `data:text/json;charset=utf-8,${encodeURIComponent(contents)}`
    );
    link.setAttribute("download", `${$decisionMatrix.name}_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const importMatrix = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".json");
    input.addEventListener("change", (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt: any) => {
        const contents = evt.target.result;
        if (!contents) return;
        decisionMatrix.set(JSON.parse(contents));
      };
      reader.readAsText(file);
    });
    document.body.appendChild(input);
    input.click();
    input.remove();
  };

  // Validation errors
  $: (() => {
    const errs: string[] = [];
    if ($decisionMatrix.criterias.length === 0)
      errs.push("add at least one criterion");
    if ($decisionMatrix.items.length === 0) errs.push("add at least one option");
    if ($decisionMatrix.criterias.some((c) => c.name === ""))
      errs.push("criterion name(s) cannot be empty");
    if ($decisionMatrix.items.some((i) => i.name === ""))
      errs.push("option name(s) cannot be empty");
    $decisionMatrix.items.forEach((item) => {
      item.criterias.forEach((criteria) => {
        const isMissing = criteria.value === undefined || criteria.value === null;
        const hasNames = criteria.name !== "" && item.name !== "";
        if (isMissing && hasNames) {
          errs.push(`missing ${criteria.name} for ${item.name}`);
        }
      });
    });
    if (errs.length > 0) {
      const msg =
        errs.slice(0, 3).join(" · ") +
        (errs.length > 3 ? ` · +${errs.length - 3} more` : "");
      errorMessage.set(msg);
    } else {
      errorMessage.set("");
    }
  })();

  onMount(() => {
    try {
      const saved = localStorage.getItem("decider_theme");
      if (saved === "light" || saved === "dark") {
        theme = saved as "dark" | "light";
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch (_) {}

    onMountHandler(async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const share = urlParams.get("share");
      if (share) {
        try {
          const record = await pb.collection("matrices").getOne(share);
          if (record) {
            const { id, data, isShared, user: userId } = record;
            decisionMatrixId.set(id);
            decisionMatrix.set({ ...data, isShared, isEncrypted: false, userId });
          }
        } catch (err: any) {
          alert(err.message ?? err.toString());
        }
      }
    });
  });

  $: isEmpty = JSON.stringify($decisionMatrix) === JSON.stringify(emptyMatrix);
  $: matrixIdDisplay = $decisionMatrixId
    ? $decisionMatrixId.slice(0, 7)
    : "unsaved";
  $: avatarLetter = $user?.username?.[0]?.toUpperCase() ?? "?";
</script>

<!-- ============ TOP BAR ============ -->
<nav class="topbar">
  <div class="brand">
    <span class="hex"></span>
    <span>DECIDER</span>
  </div>

  <div class="decision-title-wrap">
    <input
      class="decision-title"
      type="text"
      bind:value={$decisionMatrix.name}
      placeholder="Untitled Decision"
      spellcheck="false"
    />
  </div>

  <div class="topbar-right">
    <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
      <svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
      </svg>
      <svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>

    {#if $user}
      <span class="avatar">{avatarLetter}</span>
      <button class="chip-btn">{$user.username}</button>
      <span class="topbar-sep">|</span>
      <button class="chip-btn" on:click={() => goto("/my-decisions")}>Decisions</button>
      <button class="chip-btn" on:click={() => goto("/chats")}>Chats</button>
      <button class="chip-btn is-danger" on:click={() => goto("/logout")}>Logout</button>
    {:else}
      <button class="chip-btn" on:click={() => goto("/login")}>Login</button>
      <button class="chip-btn" on:click={() => goto("/register")}>Register</button>
    {/if}
  </div>
</nav>

<!-- ============ MAIN ============ -->
<main class="dm-main">
  <!-- Toolbar -->
  <div class="toolbar">
    <div class="status-line">
      <span><span class="dot"></span>Autosaved</span>
      <span class="sep">/</span>
      <span>MATRIX <span class="val">{matrixIdDisplay}</span></span>
      <span class="sep">/</span>
      <span>CRITERIA <span class="val">{$decisionMatrix.criterias.length}</span></span>
      <span class="sep">/</span>
      <span>OPTIONS <span class="val">{$decisionMatrix.items.length}</span></span>
      {#if $user}
        <span class="sep">/</span>
        <span>ENCRYPTED <span class="val">{$shouldEncrypt ? "on" : "off"}</span></span>
      {/if}
    </div>
    <div class="action-row">
      <button class="btn btn-ghost" on:click={importMatrix}>Import</button>
      <button class="btn btn-ghost" on:click={exportMatrix}>Export</button>
      {#if $user}
        <button
          class="btn btn-ghost"
          on:click={() => shouldEncrypt.update((v) => !v)}
        >
          {$shouldEncrypt ? "🔒 Encrypted" : "🔓 Plaintext"}
        </button>
        {#if !$decisionMatrix.isEncrypted && $decisionMatrixId}
          <button
            class="btn btn-ghost"
            class:btn-loading={isSharing}
            on:click={shareHandler}
          >
            {$decisionMatrix.isShared ? "Un-share" : "Share"}
          </button>
          {#if $decisionMatrix.isShared}
            <button class="btn btn-ghost" on:click={copyShareLink}>Copy Link</button>
          {/if}
        {/if}
        {#if !isEmpty}
          <button class="btn btn-ghost btn-danger" on:click={clearMatrix}>Clear</button>
        {/if}
        <button
          class="btn btn-primary"
          class:btn-loading={isSaving}
          on:click={saveHandler}
        >
          Save
        </button>
      {/if}
    </div>
  </div>

  <!-- Mobile tabs -->
  <div class="tabs-mobile">
    <button
      class="tab-mobile"
      class:is-active={activeTab === "criteria"}
      on:click={() => (activeTab = "criteria")}
    >Criteria</button>
    <button
      class="tab-mobile"
      class:is-active={activeTab === "options"}
      on:click={() => (activeTab = "options")}
    >Options</button>
    <button
      class="tab-mobile"
      class:is-active={activeTab === "results"}
      on:click={() => (activeTab = "results")}
    >Results</button>
  </div>

  <!-- Workspace -->
  <div class="workspace">
    <!-- Criteria Panel -->
    <section class="panel" class:is-hidden-mobile={activeTab !== "criteria"}>
      <div class="panel-head">
        <span class="panel-label">
          Criteria
          <span class="count-badge">{$decisionMatrix.criterias.length}</span>
        </span>
        <span class="panel-sublabel">weight 0–100</span>
      </div>
      <div class="panel-body">
        {#if $decisionMatrix.criterias.length === 0}
          <div class="criteria-list">
            <div class="empty-state">
              <div class="ring"></div>
              <div class="msg">No criteria yet.</div>
            </div>
          </div>
        {:else}
          <div class="criteria-list">
            {#each $decisionMatrix.criterias as criteria, index}
              <CriteriaField {criteria} {index} />
            {/each}
          </div>
        {/if}
        <button class="add-btn" on:click={addCriteria}>
          <span class="plus">+</span>
          <span>Add criterion</span>
        </button>
      </div>
    </section>

    <!-- Options Panel -->
    <section class="panel" class:is-hidden-mobile={activeTab !== "options"}>
      <div class="panel-head">
        <span class="panel-label">
          Options
          <span class="count-badge">{$decisionMatrix.items.length}</span>
        </span>
        <span class="panel-sublabel">score 0–10</span>
      </div>
      <div class="panel-body">
        {#if $decisionMatrix.items.length === 0}
          <div class="items-list">
            <div class="empty-state">
              <div class="ring"></div>
              <div class="msg">No options yet.</div>
            </div>
          </div>
        {:else}
          <div class="items-list">
            {#each $decisionMatrix.items as item, index}
              <ItemField
                {item}
                {index}
                isTop={item.name === topItemName &&
                  $decisionMatrix.criterias.length > 0}
              />
            {/each}
          </div>
        {/if}
        <button class="add-btn" on:click={addItem}>
          <span class="plus">+</span>
          <span>Add option</span>
        </button>
      </div>
    </section>

    <!-- Results Panel -->
    <section
      class="panel results-panel"
      class:is-hidden-mobile={activeTab !== "results"}
    >
      <div class="panel-head">
        <span class="panel-label">
          Results
          <span class="count-badge">{$decisionMatrix.items.length}</span>
        </span>
        <span class="panel-sublabel">live · weighted mean</span>
      </div>
      <div class="panel-body">
        <DecisionResult />
      </div>
    </section>
  </div>

  <!-- Footer -->
  <div class="footer-strip">
    <div>DECIDER · {theme} build</div>
    <div class="cols">
      <span>score = Σ(value × weight) / n</span>
      <span>⌘S save</span>
    </div>
  </div>
</main>
