<script lang="ts">
  import { decisionMatrix } from "$lib";
</script>

<div>
  <p class="subtitle">Give your decision a title:</p>
  <input
    class="input"
    type="text"
    placeholder="Decision title"
    bind:value={$decisionMatrix.name}
  />
</div>
