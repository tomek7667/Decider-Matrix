<script lang="ts">
  import { onMount } from "svelte";
  import { onMountHandler, pb, user } from "$lib";
  import { goto } from "$app/navigation";
  import GoBackButton from "$lib/GoBackButton.svelte";

  interface Invitee {
    email: string;
    userId: string;
    username: string;
  }

  let invitees: Invitee[] = [];

  let isLoading = true;
  let chatName = "";
  let inviteeEmail = "";

  onMount(async () => {
    onMountHandler();
    if ($user === null) {
      goto("/login");
      return;
    }
    isLoading = false;
  });

  const createButtonHandler = async () => {
    isLoading = true;
    try {
      if (chatName === "") {
        throw new Error("Chat name cannot be empty.");
      }
      const participants = invitees.map((i) => i.userId);
      if (participants.length === 0) {
        throw new Error("You need to invite at least one person.");
      }

      await pb.collection("chats").create({
        name: chatName,
        participants,
        creator: $user!.id,
      });
      goto("/chats");
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const inviteButtonHandler = async () => {
    isLoading = true;
    try {
      const record = await pb.collection("users_public").getOne(inviteeEmail);
      if (record === undefined) {
        throw new Error("User not found.");
      }
      const invitee = {
        email: record.id,
        userId: record.userId,
        username: record.username,
      };

      if (invitees.some((i) => i.email === invitee.email)) {
        throw new Error("User already invited.");
      }

      if (invitee.userId === $user!.id) {
        throw new Error("You cannot invite yourself.");
      }

      invitees.push({
        email: invitee.email,
        userId: invitee.userId,
        username: invitee.username,
      });

      inviteeEmail = "";
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const removeInviteeButtonHandler = (email: string) => {
    invitees = invitees.filter((i) => i.email !== email);
  };
</script>

<div class="hero">
  <div class="hero-body">
    <GoBackButton />
    <hr />
    <p class="title">Create a chat</p>
    <form method="post" class="form">
      <div class="field">
        <p class="label">Chat name</p>
        <div class="control">
          <input
            type="text"
            class="input"
            bind:value={chatName}
            placeholder="Chat name"
          />
        </div>
      </div>
      <div class="field">
        <p class="label">Participants</p>
        <div class="control">
          <div class="columns">
            <div class="column">
              <input
                type="text"
                class="input"
                placeholder="Invitee e-mail"
                bind:value={inviteeEmail}
              />
            </div>
            <div class="column">
              <button
                class="button is-success {isLoading ? 'is-loading' : ''}"
                on:click|preventDefault={inviteButtonHandler}>Invite</button
              >
            </div>
          </div>
          <div>
            {#each invitees as invitee}
              <div class="columns">
                <div class="column">
                  <p>{invitee.username}</p>
                </div>
                <div class="column">
                  <button
                    class="button is-danger {isLoading ? 'is-loading' : ''}"
                    on:click|preventDefault={() =>
                      removeInviteeButtonHandler(invitee.email)}>Remove</button
                  >
                </div>
              </div>
            {/each}
          </div>
        </div>
        <div />
      </div>
      <input
        type="submit"
        class="button is-primary {isLoading ? 'is-loading' : ''}"
        value="Create"
        on:submit|preventDefault={createButtonHandler}
        on:click|preventDefault={createButtonHandler}
      />
    </form>
  </div>
</div>
