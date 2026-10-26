import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { compileStory } from "../src/story-engine/compiler";

const story = JSON.parse(readFileSync(new URL("../stories/my-phone/story.json", import.meta.url), "utf8"));
const work = compileStory(story).work;

test("My Phone browser smoke: lock screen and home screen", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/work.json", (route) => route.fulfill({ json: work }));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "轻触解锁" })).toBeVisible();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await expect(page.getByRole("heading", { name: "输入密码" })).toBeVisible();
  for (let i = 0; i < 3; i++) {
    for (const digit of "111111") {
      await page.getByRole("button", { name: "密码键" + digit }).click();
    }
  }
  await expect(page.getByText("密码提示：蒸蒸生日 ♡")).toBeVisible();
  for (const digit of "040928") {
    await page.getByRole("button", { name: "密码键" + digit }).click();
  }
  await expect(page.locator(".device-lock")).toHaveCount(0);
  expect(errors).toEqual([]);
});
