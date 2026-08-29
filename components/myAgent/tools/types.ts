/**
 * Agent 工具共享类型：可打开页面、工具执行结果、前端跳转指令。
 */
export type ProjectLink = {
  id: string;
  href: string;
  /** true：走 Next 路由；false：整页跳转到静态资源 */
  internal: boolean;
  title: { zh: string; en: string };
  aliases: readonly string[];
};

/** open_project 执行结果：成功带回跳转信息，失败带回可选 id */
export type OpenProjectResult =
  | {
      ok: true;
      id: string;
      href: string;
      internal: boolean;
      title: string;
    }
  | {
      ok: false;
      error: string;
      suggestions: string[];
    };

/** 前端收到后用于 router.push 或整页跳转 */
export type AgentNavigateAction = {
  href: string;
  internal: boolean;
};
