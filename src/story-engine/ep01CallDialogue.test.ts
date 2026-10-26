import { describe, expect, it } from "vitest";
import { initialRuntime, type Runtime, type Work } from "../schema";
import { ep01CallOpening, ep01CallBranches, ep01CallChoices, chooseEp01CallBranch } from "./ep01CallDialogue";
const work = { id: "unpublished-lover-ep01", updatedAt: 1, phone: { date: "2026-10-23", time: "22:00" }, variables: {} } as Work;
describe("EP01 scene14 call dialogue", () => {
  it("requires answering before presenting choices, then locks the selected branch", () => {
    let state: Runtime = initialRuntime(work);
    expect(ep01CallChoices(state)).toHaveLength(0);
    state = { ...state, variables: { ep01FirstCallAnswered: true } };
    expect(ep01CallOpening).toHaveLength(4);
    expect(ep01CallBranches.map((x) => x.replies.length)).toEqual([4, 4, 5]);
    expect(ep01CallChoices(state)).toHaveLength(3);
    expect(chooseEp01CallBranch(state, "invalid")).toBe(state);
    state = chooseEp01CallBranch(state, "ep01-call-branch-C");
    expect(state.variables.ep01CallBranch).toBe("C");
    expect(ep01CallChoices(state)).toHaveLength(0);
    expect(chooseEp01CallBranch(state, "ep01-call-branch-A")).toBe(state);
  });
});
