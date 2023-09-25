<script lang="ts">
  import GoBackButton from "$lib/GoBackButton.svelte";
  import {
    createKey,
    deserializeUser,
    hexlify,
    onMountHandler,
    pb,
    symmetricKey,
    user,
  } from "$lib";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import RegisterButton from "../RegisterButton.svelte";

  let isLoading = true;
  const data = {
    username: "",
    password: "",
  };

  const loginButtonHandler = async () => {
    isLoading = true;
    try {
      const response = await pb
        .collection("users")
        .authWithPassword(data.username, data.password);

      const { token, record } = response;
      pb.authStore.save(token);

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
        $symmetricKey = await createKey(data.password);
        $user = deserializeUser(record);
        goto("/");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.log(err.message);
      alert(err.message ?? err.toString());
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
    <RegisterButton />
    <hr />
    <form method="post" class="form">
      <p class="title">Login</p>
      <p class="subtitle">
        Authenticate using your username or e-mail address given while
        registration
      </p>
      <div class="field">
        <p class="label">Username or email</p>
        <div class="control">
          <input
            type="text"
            class="input"
            placeholder="john123 or abc@example.com"
            bind:value={data.username}
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
      <br />
      <button
        class="button is-success {isLoading ? 'is-loading' : ''}"
        on:click|preventDefault={loginButtonHandler}>Login</button
      >
    </form>
  </div>
</div>
