<script lang="ts">
  import {
    decisionMatrixId,
    decisionMatrix,
    pb,
    user,
    shouldEncrypt,
    symmetricKey,
    encryptWithKey,
    decryptMatrix,
  } from "$lib";
  let isLoading = false;

  const saveButtonHandler = async () => {
    isLoading = true;
    try {
      if ($shouldEncrypt) {
        await encryptedSave();
      } else {
        await unencryptedSave();
      }
    } catch (err: any) {
      alert(err.message ?? err.toString());
    }
    isLoading = false;
  };

  const unencryptedSave = async () => {
    if (!$user) {
      throw new Error("You need to be logged in to save a matrix");
    }
    if ($decisionMatrixId) {
      const updateData = {
        data: $decisionMatrix,
      };
      try {
        const record = await pb
          .collection("matrices")
          .update($decisionMatrixId, updateData);
        const { id, data, isShared, user } = record;
        decisionMatrixId.set(id);
        decisionMatrix.set({
          ...data,
          isEncrypted: false,
          isShared,
          userId: user,
        });
      } catch (err: any) {
        if (err.message === `The requested resource wasn't found.`) {
          const createData = {
            data: $decisionMatrix,
            user: $user.id,
            isShared: false,
          };
          const record = await pb.collection("matrices").create(createData);
          const { id, data, isShared } = record;
          decisionMatrixId.set(id);
          decisionMatrix.set({
            ...data,
            isEncrypted: false,
            isShared,
            userId: $user.id,
          });
        } else {
          const errorMessage = err.message ?? err.toString();
          alert(`Unencrypted save error: ${errorMessage}`);
        }
      }
    } else {
      const createData = {
        data: $decisionMatrix,
        user: $user.id,
      };
      const record = await pb.collection("matrices").create(createData);
      const { id, data, isShared } = record;
      decisionMatrixId.set(id);
      decisionMatrix.set({
        ...data,
        isEncrypted: false,
        isShared,
        userId: $user.id,
      });
    }
  };

  const encryptedSave = async () => {
    if (!$user) {
      throw new Error("You need to be logged in to save a matrix");
    }
    if (!$symmetricKey) {
      throw new Error(
        "Please log out and log in again in order to save encrypted matrices. Symmetric key should be created on login."
      );
    }
    if ($decisionMatrixId) {
      const encryptedMatrix = await encryptWithKey(
        JSON.stringify($decisionMatrix),
        $symmetricKey
      );
      const updateData = {
        data: encryptedMatrix,
      };
      try {
        const record = await pb
          .collection("matrices_encrypted")
          .update($decisionMatrixId, updateData);
        const { id, data, isShared } = record;
        const matrix = await decryptMatrix(data);
        decisionMatrixId.set(id);
        decisionMatrix.set({
          ...matrix,
          isEncrypted: true,
          isShared,
          userId: $user.id,
        });
      } catch (err: any) {
        if (err.message === `The requested resource wasn't found.`) {
          const createData = {
            data: encryptedMatrix,
            user: $user.id,
          };
          const record = await pb
            .collection("matrices_encrypted")
            .create(createData);
          const { id, data, isShared } = record;
          const matrix = await decryptMatrix(data);
          decisionMatrixId.set(id);
          decisionMatrix.set({
            ...matrix,
            isEncrypted: true,
            isShared,
            userId: $user.id,
          });
        } else {
          const errorMessage = err.message ?? err.toString();
          alert(`Encrypted save error: ${errorMessage}`);
        }
      }
    } else {
      const encryptedMatrix = await encryptWithKey(
        JSON.stringify($decisionMatrix),
        $symmetricKey
      );

      const createData = {
        data: encryptedMatrix,
        user: $user.id,
      };
      const record = await pb
        .collection("matrices_encrypted")
        .create(createData);

      const { id, data, isShared } = record;
      const matrix = await decryptMatrix(data);
      decisionMatrixId.set(id);
      decisionMatrix.set({
        ...matrix,
        isEncrypted: true,
        isShared,
        userId: $user.id,
      });
    }
  };
</script>

<button
  class="button is-success {isLoading ? 'is-loading' : ''}"
  on:click={saveButtonHandler}>Save</button
>
