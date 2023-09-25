<script lang="ts">
  import { shouldEncrypt } from "$lib";
</script>

<div class="card content button-like">
  <label class="checkbox">
    <input type="checkbox" bind:checked={$shouldEncrypt} />
    Encrypt matrix
  </label>
</div>

<style>
  .button-like {
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    border-radius: 25px;
  }
</style>
