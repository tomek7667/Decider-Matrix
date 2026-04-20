<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { onMountHandler, pb, user } from "$lib";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import SubNav from "../SubNav.svelte";

  let page = 1;
  const itemsPerPage = 10;
  let lastPage = 0;

  interface Chat {
    created: Date;
    creator: string;
    id: string;
    name: string;
    participants: string[];
    updated: Date;
  }

  interface Message {
    created: Date;
    chat: string;
    id: string;
    sender: string;
    senderUsername: string;
    text: string;
    updated: Date;
  }

  let isLoading = true;
  let chats: Chat[] = [];
  let selectedChat: Chat | null = null;
  let selectedChatMessages: Message[] = [];
  let messageToSend = "";

  const keydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && messageToSend !== "" && selectedChat) {
      sendMessage();
    }
  };

  onMount(async () => {
    onMountHandler();
    document.addEventListener("keydown", keydown);
    if ($user === null) {
      goto("/login");
      return;
    }
    try {
      await refreshChats();
    } catch (err: any) {
      alert(err.message ?? err.toString());
      goto("/");
    }
    isLoading = false;
  });

  onDestroy(() => {
    if (browser) document.removeEventListener("keydown", keydown);
    pb.collection("messages").unsubscribe();
  });

  const refreshChats = async () => {
    const result = await pb.collection("chats").getList(page, itemsPerPage, {
      sort: "-updated",
    });
    lastPage = result.totalPages;
    chats = result.items.map((c) => ({
      created: new Date(c.created),
      creator: c.creator,
      id: c.id,
      name: c.name,
      participants: c.participants,
      updated: new Date(c.updated),
    }));
  };

  const openChat = async (id: string) => {
    isLoading = true;
    try {
      const chat = chats.find((c) => c.id === id);
      if (!chat) throw new Error("Chat not found.");
      const records = await pb.collection("messages").getList(1, 50, {
        filter: `chat='${id}'`,
        sort: "-updated",
        expand: "sender",
        fields: "*,expand.sender.username",
      });
      selectedChat = chat;
      selectedChatMessages = records.items.map((m) => ({
        created: new Date(m.created),
        chat: m.chat,
        id: m.id,
        sender: m.sender,
        senderUsername: m.expand?.sender.username ?? "",
        text: m.text,
        updated: new Date(m.updated),
      }));
      pb.collection("messages").subscribe("*", async (e) => {
        if (!selectedChat || e.record.chat !== selectedChat.id) return;
        const { username } = await pb
          .collection("users")
          .getOne(e.record.sender, { fields: "id,username" });
        selectedChatMessages = [
          {
            created: new Date(e.record.created),
            chat: e.record.chat,
            id: e.record.id,
            sender: e.record.sender,
            senderUsername: username,
            text: e.record.text,
            updated: new Date(e.record.updated),
          },
          ...selectedChatMessages,
        ];
      });
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const closeChat = async () => {
    pb.collection("messages").unsubscribe();
    selectedChat = null;
    selectedChatMessages = [];
  };

  const deleteChat = async (id: string) => {
    if (!confirm("Delete this chat?")) return;
    isLoading = true;
    try {
      await pb.collection("chats").delete(id);
      chats = chats.filter((c) => c.id !== id);
      if (selectedChat?.id === id) closeChat();
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const sendMessage = async () => {
    if (!messageToSend.trim() || !selectedChat) return;
    const text = messageToSend;
    messageToSend = "";
    try {
      await pb.collection("messages").create({
        text,
        chat: selectedChat.id,
        sender: $user?.id,
      });
    } catch (err: any) {
      alert(err.message ?? err.toString());
      messageToSend = text;
    }
  };

  const prevPage = async () => {
    if (page <= 1) return;
    isLoading = true;
    page--;
    try { await refreshChats(); } catch (err: any) { alert(err.message ?? err.toString()); }
    isLoading = false;
  };

  const nextPage = async () => {
    if (page >= lastPage) return;
    isLoading = true;
    page++;
    try { await refreshChats(); } catch (err: any) { alert(err.message ?? err.toString()); }
    isLoading = false;
  };
</script>

<SubNav title="CHATS" backHref="/" />

<div class="chat-workspace">
  <!-- Sidebar: chat list -->
  <div class="chat-sidebar" class:is-visible={!selectedChat}>
    <div class="chat-sidebar-header">
      <span class="chat-sidebar-title">Chats</span>
      <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px;" on:click={() => goto("/chats/create")}>
        + New
      </button>
    </div>

    {#if isLoading && chats.length === 0}
      <div class="spin-wrap"><div class="spinner"></div></div>
    {:else if chats.length === 0}
      <div class="chat-empty" style="padding: 40px 20px;">
        <div class="ring" style="width: 32px; height: 32px;"></div>
        <span>No chats yet.</span>
      </div>
    {:else}
      <div class="chat-list">
        {#each chats as chat}
          <div
            class="chat-list-item"
            class:is-active={selectedChat?.id === chat.id}
            role="button"
            tabindex="0"
            on:click={() => openChat(chat.id)}
            on:keypress={(e) => e.key === "Enter" && openChat(chat.id)}
          >
            <div class="chat-list-info">
              <div class="chat-list-name">{chat.name}</div>
              <div class="chat-list-date">{chat.updated.toLocaleDateString()}</div>
            </div>
            {#if chat.creator === $user?.id}
              <div class="chat-list-actions">
                <button
                  class="ghost-x"
                  title="Delete chat"
                  on:click|stopPropagation={() => deleteChat(chat.id)}
                >×</button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
      {#if lastPage > 1}
        <div class="pagination-row">
          <button class="btn btn-ghost" style="padding: 6px 10px; font-size: 12px;" disabled={page === 1} on:click={prevPage}>←</button>
          <span class="page-info">{page} / {lastPage}</span>
          <button class="btn btn-ghost" style="padding: 6px 10px; font-size: 12px;" disabled={page === lastPage} on:click={nextPage}>→</button>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Main: chat view -->
  <div class="chat-main">
    {#if selectedChat}
      <div class="chat-main-header">
        <button class="chat-main-back" on:click={closeChat} aria-label="Back to list">
          ←
        </button>
        <span class="chat-main-name">{selectedChat.name}</span>
      </div>

      <div class="chat-messages">
        {#each selectedChatMessages as message (message.id)}
          <div
            class="chat-message"
            class:is-mine={message.sender === $user?.id}
          >
            <div class="chat-message-meta">
              <span class="chat-sender">
                {message.sender === $user?.id ? "You" : message.senderUsername}
              </span>
              <span>{message.created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div class="chat-bubble">{message.text}</div>
          </div>
        {/each}
      </div>

      <div class="send-bar">
        <input
          class="send-input"
          type="text"
          placeholder="Type a message…"
          bind:value={messageToSend}
          disabled={isLoading}
        />
        <button
          class="send-btn"
          on:click={sendMessage}
          disabled={isLoading || !messageToSend.trim()}
        >Send</button>
      </div>
    {:else}
      <div class="chat-empty">
        <div class="ring" style="width: 40px; height: 40px;"></div>
        <span>Select a chat to start messaging</span>
        <button class="btn btn-ghost" on:click={() => goto("/chats/create")}>
          + Create new chat
        </button>
      </div>
    {/if}
  </div>
</div>
