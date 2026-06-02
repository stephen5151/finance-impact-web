# 事件影响推演 · 金融事件生活影响推演

一个面向年轻个人用户的网页产品：把最近一两个月的重要政治经济事件，
翻译成普通人能理解的**生活影响推演**。不提供投资建议，也不承诺精准预测市场，
核心价值是帮你看懂「一件大事为什么会影响普通人的生活，以及它是如何一步步传导的」。

> 本网站仅用于信息理解与生活影响分析，不构成投资建议。投资需谨慎。

## 功能（第一版）

- **最近事件**：首页展示 8 个最近事件卡片，点开是统一的 10 段结构化推演。
- **直接提问**：输入「这会对我有什么影响」，系统把问题映射到相关事件和生活维度，
  输出按「直接回答 → 影响路径 → 生活维度 → 风险提示」组织的回答卡片。
- 全站固定的非投资建议声明与可信度边界说明。

内容采用「结构化事件 + 问题映射」的方式（见 `web/src/data/`），不依赖实时行情或大模型，
保证内容稳定、可人工校对、易于上线。

## 技术栈

Next.js 16（App Router）+ React 19 + Tailwind CSS v4 + TypeScript。

## 本地开发

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
```

## 部署

托管在 Vercel，连接本 GitHub 仓库自动部署：

- **Framework Preset**: Next.js
- **Root Directory**: `web`

每次推送到 `main` 分支，Vercel 自动构建并发布到生产域名。

## 设计文档

详见 [`docs/superpowers/specs/2026-05-29-finance-impact-web-design.md`](docs/superpowers/specs/2026-05-29-finance-impact-web-design.md)。
