type PageTableItem = {
    pageID: number;             // 页面号
    duration: number;           // 页面进入内存以来的时间
    lastAccess: number;         // 页面上次访问至今的时间
};

type SwitchItem = {
    time: number;           // 发生时间
    index: number;          // 被置换的页框号（从0开始）
    before: number;         // 被置换的页面号
    after: number;          // 置入的页面号
};

export type { PageTableItem, SwitchItem };
