import type { Runtime } from "../schema";

export type Ep01SetupResult = { ok: true; name: string; birthYear: number } | { ok: false };

export function validateEp01PlayerSetup(rawName: string, rawBirthYear: string): Ep01SetupResult {
  const name = rawName.trim();
  if (!name || name.length > 30 || !/^[0-9]{4}$/.test(rawBirthYear)) return { ok: false };
  const birthYear = Number(rawBirthYear);
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > 2026) return { ok: false };
  return { ok: true, name, birthYear };
}

export function completeEp01PlayerSetup(runtime: Runtime, rawName: string, rawBirthYear: string): Runtime {
  if (runtime.workId !== "unpublished-lover-ep01" || runtime.variables.ep01PlayerSetupDone === true) return runtime;
  const result = validateEp01PlayerSetup(rawName, rawBirthYear);
  if (!result.ok) return runtime;
  return { ...runtime, variables: {
    ...runtime.variables,
    ep01PlayerName: result.name,
    ep01BirthYear: result.birthYear,
    ep01PlayerSetupDone: true,
  } };
}
