import PocketBase from "pocketbase";
import { writable } from "svelte/store";
import { user } from "./auth";
export * from "./auth";

export const pb = new PocketBase("https://pocketbase.cyber-man.pl");
export interface Criteria {
  name: string;
  importance: number;
}

interface FilledCriteria extends Criteria {
  value?: number;
}

export interface Item {
  name: string;
  criterias: FilledCriteria[];
}

interface DecisionMatrix {
  name: string;
  criterias: Criteria[];
  items: Item[];
}

export interface MatrixRow {
  id: string;
  data: DecisionMatrix;
  updated: Date;
  created: Date;
}

export const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const emptyMatrix: DecisionMatrix = {
  name: "An example decision",
  criterias: [],
  items: [],
};

export const decisionMatrix = writable<DecisionMatrix>(clone(emptyMatrix));

export const errorMessage = writable<string>("");

export const decisionMatrixId = writable<string | null>(null);

export const clearMatrix = () => {
  decisionMatrix.set(clone(emptyMatrix));
  decisionMatrixId.set(null);
};

const subscribe = () => {
  decisionMatrix.subscribe((matrix) => {
    window.localStorage.setItem("decisionMatrix", JSON.stringify(matrix));
  });

  user.subscribe((user) => {
    window.localStorage.setItem("user", JSON.stringify(user));
  });

  decisionMatrixId.subscribe((id) => {
    if (id) {
      window.localStorage.setItem("decisionMatrixId", id);
    } else {
      window.localStorage.removeItem("decisionMatrixId");
    }
  });
};

export const onMountHandler = (callback?: () => void) => {
  const _decisionMatrix = window.localStorage.getItem("decisionMatrix");
  if (_decisionMatrix) {
    decisionMatrix.set(JSON.parse(_decisionMatrix));
  } else {
    clearMatrix();
  }

  const _user = window.localStorage.getItem("user");
  if (_user) {
    user.set(JSON.parse(_user));
  } else {
    user.set(null);
  }

  const _decisionMatrixId = window.localStorage.getItem("decisionMatrixId");
  if (_decisionMatrixId) {
    decisionMatrixId.set(_decisionMatrixId);
  } else {
    decisionMatrixId.set(null);
  }

  subscribe();
  if (callback) {
    callback();
  }
};
