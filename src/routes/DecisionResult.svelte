<script lang="ts">
  import { decisionMatrix, errorMessage } from "$lib";
  interface Result {
    name: string;
    total: number;
  }
  let denominator = 0;
  let results: Result[] = [];

  decisionMatrix.subscribe((matrix) => {
    denominator = matrix.criterias.reduce(
      (acc, criteria) => acc + criteria.importance,
      0
    );
    results = matrix.items
      .map((item) => {
        const { name, criterias } = item;
        const nominator = criterias.reduce((acc, criteria) => {
          if (criteria.value === undefined) {
            $errorMessage = `item ${name} has undefined value for ${criteria.name}`;
            return acc;
          }
          return acc + criteria.value * criteria.importance;
        }, 0);
        const total =
          Math.round((nominator / criterias.length) * 10000) / 10000;
        return {
          name,
          total
        };
      })
      .sort((a, b) => b.total - a.total);
  });

  const exportResultsHandler = () => {
    const csvHeader = `"Item";"Score";"Score / Max score"\n`;
    const csvResultsRows = results
      .map(
        (result) =>
          `"${result.name}";${result.total};"${
            Math.round((result.total / highestScore) * 10000) / 100
          }%"`
      )
      .join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${csvHeader}${csvResultsRows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = `${$decisionMatrix.name}_${Date.now()}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  $: highestScore = results[0]?.total ?? 0;
</script>

<p class="subtitle">Results for decision:</p>
<p class="title">{$decisionMatrix.name}</p>
<table class="table">
  <thead>
    <tr>
      <th>Place</th>
      <th>Option</th>
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

<button class="button is-success" on:click={exportResultsHandler}
  >Export results</button
>
