import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  createInitialCommerce,
  assignAutomaticSeries,
  migrateCommerce,
  type CommerceDocument,
  type CommerceState,
  validateCommerce,
} from "./model";

export class CommerceError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function storageKind(): "local" | "supabase" | "seed" {
  if (process.env.CATALOG_STORAGE === "supabase") return "supabase";
  if (
    process.env.CATALOG_STORAGE === "local" ||
    process.env.NODE_ENV !== "production"
  )
    return "local";
  return "seed";
}
const localPath = () =>
  process.env.CATALOG_LOCAL_PATH ||
  path.join(process.cwd(), ".local", "catalog.json");
function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new CommerceError(
      "Не настроено подключение каталога к базе данных.",
      503,
    );
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(10000) }),
    },
  });
}
export async function readCommerce(): Promise<CommerceState> {
  if (storageKind() === "seed") return createInitialCommerce();
  if (storageKind() === "supabase") {
    const { data, error } = await database()
      .from("site_commerce")
      .select("state")
      .eq("id", "catalog")
      .maybeSingle();
    if (error)
      throw new CommerceError(
        "Не удалось прочитать базу каталога. Проверьте подключение и миграцию.",
        503,
      );
    return migrateCommerce(data?.state ?? createInitialCommerce());
  }
  try {
    return migrateCommerce(
      JSON.parse(
        await fs.readFile(/* turbopackIgnore: true */ localPath(), "utf8"),
      ),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return createInitialCommerce();
    throw new CommerceError(
      "Не удалось прочитать локальный каталог. Исходные цены не подставлены вместо сохранённых.",
      503,
    );
  }
}
export async function writeCommerce(
  doc: CommerceDocument,
  expectedRevision: number,
  publish: boolean,
): Promise<CommerceState> {
  const errors = validateCommerce(doc, publish);
  if (errors.length) throw new CommerceError(errors.slice(0, 12).join("\n"));
  // Never trust an old or manually altered series value from an automatic build.
  doc = assignAutomaticSeries(doc);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
    throw new CommerceError("Неверная версия каталога.");
  if (storageKind() === "seed")
    throw new CommerceError(
      "Перед сохранением настройте CATALOG_STORAGE и базу каталога.",
      503,
    );
  if (storageKind() === "supabase") {
    const current = await readCommerce();
    if (current.revision !== expectedRevision)
      throw new CommerceError(
        "Каталог уже изменён. Обновите страницу и повторите правку.",
        409,
      );
    const next = nextState(current, doc, publish);
    const { error } = await database().rpc("save_site_commerce", {
      expected_revision: expectedRevision,
      next_state: next,
    });
    if (error?.code === "40001")
      throw new CommerceError(
        "Каталог уже изменён. Обновите страницу и повторите правку.",
        409,
      );
    if (error)
      throw new CommerceError(
        "Не удалось сохранить каталог в базе данных.",
        503,
      );
    return next;
  }
  const file = localPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  let lock;
  try {
    lock = await fs.open(`${file}.lock`, "wx");
  } catch {
    throw new CommerceError(
      "Другая правка ещё сохраняется. Повторите через несколько секунд.",
      409,
    );
  }
  const temp = `${file}.${process.pid}.tmp`;
  try {
    const current = await readCommerce();
    if (current.revision !== expectedRevision)
      throw new CommerceError(
        "Каталог уже изменён. Обновите страницу и повторите правку.",
        409,
      );
    const next = nextState(current, doc, publish);
    if (current.revision > 0) {
      await fs.mkdir(`${file}.history`, { recursive: true });
      await fs
        .writeFile(
          `${file}.history/${current.revision}.json`,
          JSON.stringify(current),
          { flag: "wx", mode: 0o600 },
        )
        .catch((e) => {
          if (e.code !== "EEXIST") throw e;
        });
    }
    await fs.writeFile(temp, JSON.stringify(next, null, 2), { mode: 0o600 });
    await fs.rename(temp, file);
    return next;
  } finally {
    await fs.rm(temp, { force: true });
    await lock.close();
    await fs.rm(`${file}.lock`, { force: true });
  }
}
function nextState(
  current: CommerceState,
  doc: CommerceDocument,
  publish: boolean,
): CommerceState {
  return {
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
    draft: structuredClone(doc),
    published: publish ? structuredClone(doc) : current.published,
  };
}
