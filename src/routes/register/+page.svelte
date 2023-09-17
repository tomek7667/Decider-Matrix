<script>
  import GoBackButton from "$lib/GoBackButton.svelte";
  import { onMountHandler, pb } from "$lib";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import LoginButton from "../LoginButton.svelte";

  let isLoading = true;
  const data = {
    username: "",
    email: "",
    emailVisibility: true,
    password: "",
    passwordConfirm: "",
    name: "",
  };

  const registerButtonHandler = async () => {
    isLoading = true;
    try {
      const record = await pb.collection("users").create(data);
      if (
        record !== undefined &&
        record.avatar !== undefined &&
        record.id !== undefined &&
        record.created !== undefined &&
        record.email !== undefined &&
        record.name !== undefined &&
        record.updated !== undefined &&
        record.username !== undefined &&
        record.verified !== undefined
      ) {
        goto("/login");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.log(err);
    }
    isLoading = false;
  };

  onMount(() => {
    onMountHandler();
    isLoading = false;
  });
</script>

<div class="hero">
  <div class="hero-body">
    <GoBackButton />
    <LoginButton />
    <hr />
    <form method="post" class="form">
      <p class="title">Register</p>
      <p class="subtitle">Create an account</p>
      <div class="field">
        <p class="label">Username</p>
        <div class="control">
          <input
            type="text"
            class="input"
            placeholder="john123"
            bind:value={data.username}
            required
          />
        </div>
      </div>
      <div class="field">
        <p class="label">Name</p>
        <div class="control">
          <input
            type="text"
            class="input"
            placeholder="John Doe"
            bind:value={data.name}
            required
          />
        </div>
      </div>
      <div class="field">
        <p class="label">Email</p>
        <div class="control">
          <input
            type="email"
            class="input"
            placeholder="abc@example.com"
            bind:value={data.email}
            required
          />
        </div>
      </div>
      <div class="field">
        <p class="label">Password</p>
        <div class="control">
          <input
            type="password"
            class="input"
            placeholder="Sup3r S3cr3t P455w0rd!"
            bind:value={data.password}
            required
          />
        </div>
      </div>
      <div class="field">
        <p class="label">Confirm password</p>
        <div class="control">
          <input
            type="password"
            class="input"
            placeholder="Sup3r S3cr3t P455w0rd!"
            bind:value={data.passwordConfirm}
            required
          />
        </div>
      </div>
      <br />
      <button
        class="button is-success {isLoading ? 'is-loading' : ''}"
        on:click|preventDefault={registerButtonHandler}>Register</button
      >
    </form>
  </div>
</div>
