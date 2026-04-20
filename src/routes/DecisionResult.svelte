<script lang="ts">
  import { decisionMatrix, errorMessage } from "$lib";
  import { flip } from "svelte/animate";

  interface Result {
    name: string;
    total: number;
    hasMissing: boolean;
  }

  let results: Result[] = [];
  let highestScore = 0;

  $: {
    const matrix = $decisionMatrix;
    if (matrix.items.length === 0 || matrix.criterias.length === 0) {
      results = [];
      highestScore = 0;
    } else {
      const n = matrix.criterias.length;
      const computed = matrix.items.map((item) => {
        let sum = 0;
        let hasMissing = false;
        item.criterias.forEach((c) => {
          if (c.value === undefined || c.value === null) {
            hasMissing = true;
          } else {
            sum += (c.value as number) * c.importance;
          }
        });
        const total = Math.round((sum / n) * 10000) / 10000;
        return { name: item.name.trim() || "Unnamed option", total, hasMissing };
      });
      computed.sort((a, b) => b.total - a.total);
      results = computed;
      highestScore = computed[0]?.total ?? 0;
    }
  }
</script>

{#if results.length === 0}
  <div class="empty-state">
    <div class="ring"></div>
    <div class="msg">Results will appear once you add criteria and options.</div>
  </div>
{:else}
  <div class="results-list">
    {#each results as result, i (result.name)}
      {@const pct = highestScore > 0 ? (result.total / highestScore) * 100 : 0}
      {@const isTop = i === 0 && !result.hasMissing}
      <div class="result-row" class:is-top={isTop} animate:flip={{ duration: 250 }}>
        <div class="rank"><span class="hash">#</span>{i + 1}</div>
        <div class="result-main">
          <div class="result-row-top">
            <span class="result-name">{result.name}</span>
            <span class="result-pct"
              >{(Math.round(pct * 10) / 10).toFixed(1)}%</span
            >
          </div>
          <div class="bar-wrap">
            <div class="bar-fill" style="width: {pct.toFixed(1)}%"></div>
          </div>
        </div>
        <div class="result-meta">
          <span class="raw-score-label">score</span>
          <span class="raw-score">{result.total.toFixed(4)}</span>
        </div>
      </div>
    {/each}
  </div>
{/if}

{#if $errorMessage}
  <div class="error-bar">
    <span class="tag">VALIDATION</span>
    <span class="msg">{$errorMessage}</span>
  </div>
{/if}
