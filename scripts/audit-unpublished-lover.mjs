import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";

const root = "stories/unpublished-lover/data/";
const load = (name) => JSON.parse(readFileSync(root + name + ".json", "utf8"));
const required = ["scene22", "scene23", "scene24", "scene25", "scene26", "scene28", "scene30", "scene31"];
for (const name of required) {
  assert.ok(existsSync(root + name + ".json"), "Missing scene: " + name);
}
const paired = (messages, label, expected) => {
  assert.equal(messages.length, expected, label + " count mismatch");
  for (const [index, m] of messages.entries()) {
    assert.ok(typeof m.ko === "string" && m.ko.trim(), label + "[" + index + "] missing Korean");
    assert.ok(typeof m.zh === "string" && m.zh.trim(), label + "[" + index + "] missing Chinese");
  }
};
const s22 = load("scene22");
paired(s22.messages, "Scene22", 15);
const s23 = load("scene23");
for (const [branch, count] of Object.entries({ A: 10, B: 10, C: 11 })) {
  assert.ok(s23.branches[branch].player.ko && s23.branches[branch].player.zh);
  paired(s23.branches[branch].replies, "Scene23-" + branch, count);
}
const s24 = load("scene24");
paired(s24.opening, "Scene24 opening", 7);
for (const branch of ["A", "B", "C"]) {
  assert.ok(s24.branches[branch].player.ko && s24.branches[branch].player.zh);
  assert.ok(s24.branches[branch].replies.length > 0);
  paired(s24.branches[branch].replies, "Scene24-" + branch, s24.branches[branch].replies.length);
}
const s25 = load("scene25");
paired(s25.choices, "Scene25 choices", 3);
for (const route of ["A", "B", "C"]) {
  assert.ok(s25.opening[route].length > 0);
  paired(s25.opening[route], "Scene25 opening " + route, s25.opening[route].length);
  assert.equal(s25.replies[route].length, 3);
  for (const [index, replies] of s25.replies[route].entries()) {
    paired(replies, "Scene25 " + route + " choice " + (index + 1), replies.length);
  }
}
assert.ok(s25.final.ko && s25.final.zh);
const s26 = load("scene26");
paired(s26.messages, "Scene26", 6);
const s28 = load("scene28");
paired(s28.comments, "Scene28", 30);
const s30 = load("scene30");
paired(s30.opening, "Scene30 opening", 13);
for (const [branch, count] of Object.entries({ A: 11, B: 11, C: 12 })) {
  assert.ok(s30.branches[branch].player.ko && s30.branches[branch].player.zh);
  paired(s30.branches[branch].replies, "Scene30-" + branch, count);
}
const s31 = load("scene31");
for (const branch of ["A", "B", "C"]) {
  assert.ok(s31.subtitleByBranch[branch] && s31.summaryByBranch[branch]);
}
assert.equal(s31.trigger.delayMs, 3000);
console.log("Bilingual-scene data audit passed: 22-26, 28, 30, 31.");
console.log("This does NOT certify runtime triggers, missing scenes 1-21, or staged scenes 27 and 29.");
