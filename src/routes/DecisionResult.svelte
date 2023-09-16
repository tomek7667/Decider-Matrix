<script lang="ts">
  import { decisionMatrix, errorMessage } from "$lib";
  interface Result {
    name: string;
    total: number;
  }

  let results: Result[] = [];

  decisionMatrix.subscribe((matrix) => {
    results = matrix.items
      .map((item) => {
        const { name, criterias } = item;
        const nominator = criterias.reduce((acc, criteria) => {
          if (criteria.value === undefined) {
            $errorMessage = `item ${name} has undefined value for ${criteria.name}`;
          }
          return acc + (criteria.value ?? 0) * criteria.importance;
        }, 0);
        const denominator = matrix.criterias.reduce(
          (acc, criteria) => acc + criteria.importance,
          0
        );
        const total = Math.round((nominator / denominator) * 10000) / 10000;
        return {
          name,
          total
        };
      })
      .sort((a, b) => b.total - a.total);
  });

  $: highestScore = results[0]?.total ?? 0;
</script>

<p class="subtitle">Results for decision:</p>
<p class="title">{$decisionMatrix.name}</p>
<table class="table">
  <thead>
    <tr>
      <th>Place</th>
      <th>Item</th>
      <th>Score</th>
      <th>Score / Max score</th>
    </tr>
  </thead>

  <tbody>
    {#each results as result, index}
      <tr>
        <th>{index + 1}</th>
        <td>{result.name}</td>
        <td>{result.total}</td>
        <td>{Math.round((result.total / highestScore) * 10000) / 100}%</td>
      </tr>
    {/each}
  </tbody>
</table>

<button class="button is-success">Export results</button>
