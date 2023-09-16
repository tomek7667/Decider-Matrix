<script lang="ts">
  import { errorMessage } from "$lib";
</script>

<p class="subtitle errorMessage">An error occurred:</p>
<p class="title errorMessage">{$errorMessage}</p>

<style>
  .errorMessage {
    color: red;
  }
</style>
