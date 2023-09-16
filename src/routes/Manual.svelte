<script lang="ts">
  import { slide } from "svelte/transition";

  let manualHidden = false;
</script>

{#if !manualHidden}
  <article transition:slide>
    <p><b>Manual:</b></p>
    <ol>
      <li>
        <p>Give your decision a title!</p>
        <p>
          Example:
          <i>Which job should I choose?</i>
        </p>
      </li>
      <li>
        <p>
          By using <code>Add new item</code> button, add all options you are considering
          in your decision.
        </p>
        <p>
          Examples:
          <i>Teacher</i>,
          <i>Company worker</i>,
          <i>Freelancer</i> etc.
        </p>
      </li>
      <li>
        <p>
          By using <code>Add new criteria</code> button, add criterias that
          characterise the <b>options</b> you are considering.
        </p>
        <p>
          Examples:
          <i>Stability</i>,
          <i>Revenue</i>,
          <i>Easiness</i>,
          <i>Quality</i> etc.
        </p>
      </li>
      <li>
        <p>
          Assign an <code>Importance</code> value. This will be the weight of
          the <b>criteria</b>
        </p>
        <p>
          Examples:
          <i>Stability</i>: <i>5</i>,
          <i>Revenue</i>: <i>7</i>,
          <i>Easiness</i>: <i>2</i>,
          <i>Quality</i>: <i>6</i> etc.
        </p>
      </li>
      <li>
        <p>Rate each option!</p>
        <p>
          Example: Rating teacher with values:
          <i>Stability: 10</i>
          <i>Revenue: 1</i>
          <i>Easiness: 7</i>
          <i>Quality: 9</i>
        </p>
      </li>
      <li>
        Scroll at the <a href="#results">bottom of the page</a> to see the results!
      </li>
    </ol>
  </article>
{/if}
<br />
<button class="button" on:click={() => (manualHidden = !manualHidden)}
  >{manualHidden ? "Show" : "Hide"} the manual</button
>
