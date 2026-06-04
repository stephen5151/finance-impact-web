// 模型调用层（API key 接口）。
// 设计目标：现在先留好接口，你后续只要在环境变量里填入 API key 即可启用，
// 不填则全站自动降级回 V1 的关键词匹配，功能不受影响。
//
// 在 .env.local（本地）或 Vercel 项目的环境变量里配置：
//   LLM_API_KEY   必填，填了才启用模型；不填则降级
//   LLM_PROVIDER  可选，"anthropic"（默认）| "openai"
//                 OpenAI 兼容协议同样适用于 DeepSeek、通义千问、智谱 GLM 等，
//                 只需配合 LLM_BASE_URL 指向对应服务即可
//   LLM_MODEL     可选，默认 anthropic=claude-opus-4-8，openai=gpt-4o-mini
//   LLM_BASE_URL  可选，自定义 API 地址（自部署或第三方 OpenAI 兼容服务时使用）
//
// 安全：此模块仅在服务端运行。下面的 "server-only" 标记保证——一旦有人
// 误在客户端组件中 import 它，构建会直接失败，从源头杜绝 API key 泄露到前端。

import "server-only";

type Provider = "anthropic" | "openai";

const PROVIDER = (process.env.LLM_PROVIDER as Provider) || "anthropic";

const DEFAULT_MODEL: Record<Provider, string> = {
  anthropic: "claude-opus-4-8",
  openai: "gpt-4o-mini",
};

const DEFAULT_BASE_URL: Record<Provider, string> = {
  anthropic: "https://api.anthropic.com/v1/messages",
  openai: "https://api.openai.com/v1/chat/completions",
};

/** 是否已配置 API key —— 决定走模型还是降级。 */
export function isLLMConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY);
}

export interface ChatOptions {
  /** 系统提示 */
  system: string;
  /** 用户输入 */
  user: string;
  /** 期望模型只输出 JSON（会在提示里强约束，并解析返回） */
  json?: boolean;
  /** 超时毫秒，默认 12s */
  timeoutMs?: number;
  /** 最大输出 token，默认 1024。生成长内容（如完整推演）时调大。 */
  maxTokens?: number;
  /**
   * 采样温度。不传则用服务方默认（通常约 1，带随机性）。
   * 分类/匹配类任务（如把问题映射到固定事件）应传 0，保证同一问题每次结果一致。
   */
  temperature?: number;
}

/** 调用模型，返回纯文本。未配置 key 或失败时抛错，由调用方降级。 */
export async function chat(opts: ChatOptions): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM not configured: missing LLM_API_KEY");

  const model = process.env.LLM_MODEL || DEFAULT_MODEL[PROVIDER];
  const baseUrl = process.env.LLM_BASE_URL || DEFAULT_BASE_URL[PROVIDER];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 12_000);

  try {
    if (PROVIDER === "anthropic") {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: opts.maxTokens ?? 1024,
          system: opts.system,
          messages: [{ role: "user", content: opts.user }],
          ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return data?.content?.[0]?.text ?? "";
    }

    // openai 兼容协议（OpenAI / DeepSeek / 通义 / 智谱 …）
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? 1024,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

/** 调用模型并解析为 JSON。解析失败抛错，由调用方降级。 */
export async function chatJSON<T>(opts: ChatOptions): Promise<T> {
  const raw = await chat({ ...opts, json: true });
  // 容错：剥掉可能的 ```json 包裹
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned) as T;
}
