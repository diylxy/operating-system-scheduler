import type { PageTableItem, SwitchItem } from "@/models/Task";

/// 调度器实现部分
function scheduleOneLRU(requests: Array<number>, memory: Array<PageTableItem>): number {
    let pageOut = -1;
    let maxLastAccess = -1;
    for (let i = 0; i < memory.length; i++) {
        if (memory[i].pageID == -1) return i; // 如果有空闲内存，直接返回
        if (memory[i].lastAccess > maxLastAccess) {
            maxLastAccess = memory[i].lastAccess;
            pageOut = i;
        }
    }
    return pageOut;
}

function scheduleOneFIFO(requests: Array<number>, memory: Array<PageTableItem>): number {
    let pageOut = -1;
    let maxDuration = -1;
    for (let i = 0; i < memory.length; i++) {
        if (memory[i].pageID == -1) return i; // 如果有空闲内存，直接返回
        if (memory[i].duration > maxDuration) {
            maxDuration = memory[i].duration;
            pageOut = i;
        }
    }
    return pageOut;
}
/// 调度器选择部分
/**
 * 调度器注册
 */
const schedulers = [
    scheduleOneFIFO,
    scheduleOneLRU,
]

const schedulerNames = [
    "先进先出 (FIFO)",
    "最近最少使用 (LRU)",
]

/**
 * 调度器函数指针
 * @param requests 调度请求，用于实现更高级的算法，如OPT置换算法
 * @param memory 页框信息表
 * @returns 被置换的页框在memory数组中的下标（页框号）
 */
let scheduler: (requests: Array<number>, memory: Array<PageTableItem>) => number = schedulers[1];

/**
 * 调度器setter
 */
function setScheduler(schedulerName: string) {
    var index = schedulerNames.indexOf(schedulerName);
    if (index >= 0) {
        scheduler = schedulers[index];
    } else {
        scheduler = schedulers[1];      // 默认使用LRU算法
    }
}

/**
 * 调度器getter，获取调度器名称列表给UI
 * 这样做可以不对外暴露具体实现
 */
function getSchedulerList() {
    return schedulerNames;
}

/// 模拟程序进行的各种操作
/** 
 * @brief 模拟程序通过指令访问内存
 * 如果不缺页，返回true，代表没有引发缺页中断，同时设置上次访问时间为0
 * 否则为缺页，返回false，代表引发缺页中断，需要操作系统进行换页操作
*/
function isInMemory(pageID: number, memory: Array<PageTableItem>): boolean {
    for (let i = 0; i < memory.length; i++) {
        if (memory[i].pageID === pageID) {
            // 更新访问时间
            memory[i].lastAccess = 0;
            return true;
        }
    }
    return false;
}

/** 
 * @brief 更新访问时间
 * @note 此处可以只存储时间戳，随后用time计算出进入时间和上次访问时间
 * 但为了提高调度器代码可读性，通过此函数预先计算这两个参数，调度器中直接使用即可
*/
function updateAccessTime(memory: Array<PageTableItem>) {
    for (let i = 0; i < memory.length; i++) {
        if (memory[i].lastAccess >= 0) {
            memory[i].lastAccess++;
            memory[i].duration++;
        }
    }
}

/**
 * 调度请求
 * @param requests 页面请求序列
 * @param memory 可用内存块数
 * @returns 调度结果，一个数组，表示每次页面置换发生的时间和置换情况
 * 数组长度等于缺页中断发生次数
 * */
function schedule(requests: Array<number>, memoryAvailable: number): Array<SwitchItem> {
    if (requests.length <= 0 || memoryAvailable <= 0) return [];
    let requestsCopy = [...requests];
    let results: Array<SwitchItem> = [];
    let memory: Array<PageTableItem> = [];
    let time = 0;
    // 初始化页表
    memory.length = memoryAvailable;
    for (let i = 0; i < memoryAvailable; i++) {
        memory[i] = { pageID: -1, duration: -1, lastAccess: -1 };
    }
    while (requestsCopy.length > 0) {
        // 首先更新访问时间
        updateAccessTime(memory);
        let req = requestsCopy.shift(); // 取出一个内存访问请求
        if (!isInMemory(req!, memory)) {
            // 本次内存访问发生缺页中断
            // 通过置换算法取出一页
            let pageOutIndex = scheduler(requestsCopy, memory);
            let pageOut = memory[pageOutIndex];
            // 记录调度结果
            let result: SwitchItem = {
                time: time,
                index: pageOutIndex,
                before: pageOut.pageID,
                after: req!,
            };
            results.push(result);
            // 置换页面，更新当前页框信息
            memory[pageOutIndex].pageID = req!;
            memory[pageOutIndex].duration = 0;
            memory[pageOutIndex].lastAccess = 0;
        }
        // 更新当前时间
        time += 1;
    }
    // 返回调度结果
    return results;
}


export default {
    setScheduler,
    getSchedulerList,
    schedule,
};