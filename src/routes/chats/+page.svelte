<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { clone, onMountHandler, pb, user } from "$lib";
  import { goto } from "$app/navigation";
  import GoBackButton from "$lib/GoBackButton.svelte";
  import CreateChatButton from "./CreateChatButton.svelte";
  import { writable } from "svelte/store";

  let page = 1;
  let itemsPerPage = 10;
  let lastPage = 0;

  interface Chat {
    created: Date;
    creator: string;
    id: string;
    image: string;
    name: string;
    participants: string[];
    updated: Date;
  }

  interface Message {
    created: Date;
    chat: Date;
    id: string;
    sender: string;
    senderUsername: string;
    text: string;
    updated: Date;
  }

  let isLoading = true;
  let chats: Chat[] = [];

  let isSingleChatView = false;
  let selectedChat = writable<Chat | null>(null);
  let selectedChatMessages = writable<Message[] | null>(null);
  let messageToSend = "";

  const addListeners = async () => {
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" &&
        messageToSend !== "" &&
        isSingleChatView &&
        $selectedChat
      ) {
        sendMessageButtonHandler();
      }
    });
  };

  onMount(async () => {
    onMountHandler();
    addListeners();
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

  const refreshChats = async () => {
    const result = await pb.collection("chats").getList(page, itemsPerPage, {
      sort: "-updated",
    });
    lastPage = result.totalPages;
    chats = result.items.map((chat) => ({
      created: new Date(chat.created),
      creator: chat.creator,
      id: chat.id,
      image: chat.image,
      name: chat.name,
      participants: chat.participants,
      updated: new Date(chat.updated),
    }));
  };

  const deleteChatButtonHandler = async (id: string) => {
    isLoading = true;
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        await pb.collection("chats").delete(id);
        chats = chats.filter((chat) => chat.id !== id);
      } catch (err: any) {
        alert(err.message ?? err.toString());
      }
    }
    isLoading = false;
  };

  const subscribeToSelectedChat = async () => {
    pb.collection("messages").subscribe("*", async (e) => {
      const { record } = e;
      if (
        !$selectedChat ||
        !$selectedChatMessages ||
        !$user ||
        record.chat !== $selectedChat.id
      ) {
        return;
      }
      const { username } = await pb.collection("users").getOne(record.sender, {
        fields: "id,username",
      });

      const message: Message = {
        created: new Date(record.created),
        chat: record.chat,
        id: record.id,
        sender: record.sender,
        senderUsername: username,
        text: record.text,
        updated: new Date(record.updated),
      };
      $selectedChatMessages = [message, ...$selectedChatMessages];
    });
  };

  const unsubscribeAllChats = async () => {
    pb.collection("messages").unsubscribe();
  };

  const openChatButtonHandler = async (id: string) => {
    isLoading = true;
    try {
      isSingleChatView = true;
      let _selectedChat = chats.find((chat) => chat.id === id);
      if (_selectedChat === undefined) {
        throw new Error("Chat not found.");
      }
      const records = await pb
        .collection("messages")
        .getList(page, itemsPerPage, {
          filter: `chat='${id}'`,
          sort: "-updated",
          expand: "sender",
          fields: "*,expand.sender.username",
        });

      $selectedChat = _selectedChat;
      $selectedChatMessages = records.items.map((message) => ({
        created: new Date(message.created),
        chat: message.chat,
        id: message.id,
        sender: message.sender,
        senderUsername: message.expand?.sender.username,
        text: message.text,
        updated: new Date(message.updated),
      }));
      subscribeToSelectedChat();
    } catch (err: any) {
      alert(err.message ?? err.toString());
      isSingleChatView = false;
    }
    isLoading = false;
  };

  const previousPageButtonHandler = async () => {
    isLoading = true;
    try {
      if (page === 1) {
        return;
      }
      page--;
      await refreshChats();
    } catch (err: any) {
      alert(err?.message ?? err.toString());
    }
    isLoading = false;
  };

  const nextPageButtonHandler = async () => {
    isLoading = true;
    try {
      if (page === lastPage) {
        return;
      }
      page++;
      await refreshChats();
    } catch (err: any) {
      alert(err?.message ?? err.toString());
    }
    isLoading = false;
  };

  const sendMessageButtonHandler = async () => {
    isLoading = true;
    try {
      await pb.collection("messages").create({
        text: messageToSend,
        chat: $selectedChat?.id,
        sender: $user?.id,
      });
      messageToSend = "";
    } catch (err: any) {
      alert(err?.message ?? err.toString());
    }
    isLoading = false;
  };

  onDestroy(async () => {
    isLoading = true;
    await unsubscribeAllChats();
    isLoading = false;
  });
</script>

<div class="hero">
  <div class="hero-body">
    {#if !isSingleChatView || !$selectedChat}
      <GoBackButton />
      <hr />
      <p class="title">Chats</p>
      <div class="buttons">
        <CreateChatButton />
      </div>
      <p class="subtitle">Your chats:</p>
      {#if isLoading}
        <div class="loader" />
      {:else if chats.length === 0}
        <p>You don't have any chats yet.</p>
      {:else}
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
              <th>Name</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </tfoot>
          <tbody>
            {#each chats as chat}
              <tr>
                <td>{chat.name}</td>
                <td>{chat.created.toLocaleString()}</td>
                <td>{chat.updated.toLocaleString()}</td>
                <td>
                  <div class="buttons">
                    <button
                      class="button"
                      on:click={() => openChatButtonHandler(chat.id)}
                    >
                      Open
                    </button>
                    {#if chat.creator === $user?.id}
                      <button
                        class="button is-danger {isLoading && 'is-loading'}"
                        on:click={() => deleteChatButtonHandler(chat.id)}
                      >
                        Delete
                      </button>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="pagination">
          <button
            class="pagination-previous {isLoading ?? 'is-loading'}"
            on:click={previousPageButtonHandler}
            disabled={page === 1}>Previous</button
          >
          <button
            class="pagination-next {isLoading ?? 'is-loading'}"
            on:click={nextPageButtonHandler}
            disabled={page === lastPage}>Next page</button
          >
        </div>
      {/if}
    {:else if isSingleChatView && $selectedChat && $selectedChatMessages}
      <button
        class="button"
        on:click={async () => {
          isLoading = true;
          isSingleChatView = false;
          $selectedChat = null;
          await unsubscribeAllChats();
          isLoading = false;
        }}>Go back</button
      >
      <hr />
      <p class="title">Chat <b>{$selectedChat.name}</b></p>
      <div class="messages">
        {#each $selectedChatMessages as message}
          <div class="content flex message">
            <div class="message-tags">
              <strong
                class="tag is-light {message.sender === $user?.id
                  ? 'is-danger'
                  : 'is-success'}"
                >{message.sender === $user?.id
                  ? "You"
                  : message.senderUsername}</strong
              >
              <div class="tag is-small">
                {message.created.toLocaleString()}
              </div>
            </div>
            <p>{message.text}</p>
          </div>
        {/each}
      </div>
      <div class="create-message">
        <input
          class="input new-message-area is-rounded"
          type="text"
          placeholder="Type your message here..."
          disabled={isLoading}
          bind:value={messageToSend}
        />
        <button
          class="button is-link is-right send-message-button is-rounded {isLoading &&
            'is-loading'}"
          on:click={sendMessageButtonHandler}>Send</button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  .messages {
    display: flex;
    flex-direction: column-reverse;
    overflow-y: scroll;
    top: 0;
    scroll-behavior: smooth;
    /* spacing */
    height: 50vh;
  }

  .message {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
  }

  .message-tags {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
  }

  .create-message {
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
  }

  .new-message-area {
    flex-grow: 1;
    margin-right: 0.5rem;
  }

  .send-message-button {
    flex-grow: 0;
  }
</style>
