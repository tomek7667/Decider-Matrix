<script lang="ts">
  import { onMount } from "svelte";
  import { onMountHandler, pb, user } from "$lib";
  import { goto } from "$app/navigation";
  import SubNav from "../../SubNav.svelte";

  interface Invitee {
    email: string;
    userId: string;
    username: string;
  }

  let invitees: Invitee[] = [];
  let isLoading = false;
  let chatName = "";
  let inviteeEmail = "";

  onMount(async () => {
    onMountHandler();
    if ($user === null) {
      goto("/login");
    }
  });

  const invite = async () => {
    if (!inviteeEmail.trim()) return;
    isLoading = true;
    try {
      const record = await pb.collection("users_public").getOne(inviteeEmail);
      if (!record) throw new Error("User not found.");
      const invitee = { email: record.id, userId: record.userId, username: record.username };
      if (invitees.some((i) => i.email === invitee.email))
        throw new Error("User already invited.");
      if (invitee.userId === $user!.id) throw new Error("You cannot invite yourself.");
      invitees = [...invitees, invitee];
      inviteeEmail = "";
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const removeInvitee = (email: string) => {
    invitees = invitees.filter((i) => i.email !== email);
  };

  const createChat = async () => {
    isLoading = true;
    try {
      if (!chatName.trim()) throw new Error("Chat name cannot be empty.");
      if (invitees.length === 0) throw new Error("Invite at least one person.");
      await pb.collection("chats").create({
        name: chatName.trim(),
        participants: invitees.map((i) => i.userId),
        creator: $user!.id,
      });
      goto("/chats");
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };
</script>

<SubNav title="CREATE CHAT" backHref="/chats" />

<div class="form-page">
  <h1 class="page-heading" style="margin-bottom: 32px;">Create a chat</h1>

  <div class="form-field">
    <label class="form-label" for="chatName">Chat name</label>
    <input
      id="chatName"
      class="auth-input"
      type="text"
      placeholder="e.g. Project sync"
      bind:value={chatName}
    />
  </div>

  <div class="form-field">
    <label class="form-label" for="inviteeEmail">Invite by email</label>
    <div style="display: flex; gap: 10px;">
      <input
        id="inviteeEmail"
        class="auth-input"
        type="text"
        placeholder="friend@example.com"
        bind:value={inviteeEmail}
        style="flex: 1;"
        on:keypress={(e) => e.key === "Enter" && invite()}
      />
      <button
        class="btn btn-ghost"
        style="height: 42px; flex-shrink: 0;"
        disabled={isLoading || !inviteeEmail.trim()}
        on:click={invite}
      >
        Invite
      </button>
    </div>
  </div>

  {#if invitees.length > 0}
    <div class="form-field">
      <p class="form-section-title">Participants ({invitees.length})</p>
      <div class="invitees-box">
        {#each invitees as invitee}
          <div class="invitee-row">
            <span class="invitee-name">{invitee.username}</span>
            <button class="ghost-x" title="Remove" on:click={() => removeInvitee(invitee.email)}>×</button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <button
    class="auth-submit"
    style="margin-top: 24px;"
    disabled={isLoading || !chatName.trim() || invitees.length === 0}
    on:click={createChat}
  >
    {isLoading ? "Creating…" : "Create chat"}
  </button>
</div>
