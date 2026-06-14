// 服务端读取当前语言：从 cookie 取，未设置则默认中文。
// 客户端用 LanguageSwitcher 写 cookie 并 router.refresh()，页面随之按所选语言重渲染。
//
// 注意：用 cookies() 会让读取它的页面转为动态渲染（按语言区分输出），这是预期行为。

import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, type Lang } from "./dict";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value;
  return v === "en" ? "en" : DEFAULT_LANG;
}
