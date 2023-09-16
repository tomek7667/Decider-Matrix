import { writable } from "svelte/store";

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

export const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const emptyMatrix: DecisionMatrix = {
  name: "An example decision",
  criterias: [],
  items: [],
};

export const decisionMatrix = writable<DecisionMatrix>(clone(emptyMatrix));

export const errorMessage = writable<string>("");

export const clearMatrix = () => {
  decisionMatrix.set(clone(emptyMatrix));
};
