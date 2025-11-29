import { cookies } from "next/headers";
import { dictionaries } from "@/lib/i18n/dictionaries";

function getByPath(obj, path) {
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
}

// ✅ Next 15+: cookies() phải await
export async function getServerLang() {
  const cookieStore = await cookies();
  const c = cookieStore.get("lang")?.value;
  return c === "en" ? "en" : "vi";
}

// ✅ Server translate
export async function tServer(key, lang) {
  const l = lang || (await getServerLang());
  const v = getByPath(dictionaries[l], key);
  return typeof v === "string" ? v : key;
}
