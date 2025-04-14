import type { Task } from "@/models/Task";

const MAX_PLANS = 10000; // 方案数最大值

const arrDFS: number[] = [];
const arrDFSChecked: boolean[] = []; // 任务是否被检查过

let _taskList: Task[] = []; // 任务列表
let _resourceList: number[] = []; // 系统持有资源列表
let _resourceCount = 0; // 系统资源种类数

let dfsPtr = 0; // DFS指针
const results: number[][] = []; // 结果数组

const rescCheck: number[] = []; // 临时资源数量数组，用于模拟调度

function initDFS(taskList: Task[], resourceList: number[], resourceCount: number) {
    arrDFS.length = taskList.length;
    arrDFS.fill(-1);
    arrDFSChecked.length = taskList.length;
    arrDFSChecked.fill(false); // 初始化任务检查数组
    dfsPtr = 0; // 重置DFS指针
    results.length = 0; // 清空结果数组
    _resourceList = resourceList; // 资源列表
    _resourceCount = resourceCount; // 资源数
    rescCheck.length = resourceCount; // 临时资源数量数组
    rescCheck.fill(0); // 初始化临时资源数量数组
    // 初始化资源数量
    for (let i = 0; i < _resourceCount; i++) {
        rescCheck[i] = _resourceList[i];
    }
    // 减去任务列表已取得资源
    for (let i = 0; i < taskList.length; i++) {
        const element = taskList[i];
        for (let j = 0; j < _resourceCount; j++) {
            rescCheck[j] -= element.res[j]; // 获取资源
        }
    }
}

// 检查当前方案是否满足条件
function check() {
    for (let i = 0; i < _resourceCount; ++i) {
        if (rescCheck[i] < 0) {
            return false; // 不满足条件
        }
    }
    return true; // 满足条件
}

// 尝试调度
function scheduleTask(task: Task) {
    for (let i = 0; i < _resourceCount; ++i) {
        rescCheck[i] = rescCheck[i] + task.res[i] - task.resMax[i];
    }
}

// 撤销调度
function unScheduleTask(task: Task) {
    for (let i = 0; i < _resourceCount; ++i) {
        rescCheck[i] = rescCheck[i] - task.res[i] + task.resMax[i];
    }
}

// 任务完成，释放已取得资源
function finishTask(task: Task) {
    for (let i = 0; i < _resourceCount; ++i) {
        rescCheck[i] += task.resMax[i];
    }
}

// 任务完成后的撤销
function unfinishTask(task: Task) {
    for (let i = 0; i < _resourceCount; ++i) {
        rescCheck[i] = rescCheck[i] - task.res[i];
    }
}

function do_dfs() {     // 尽量避免使用栈空间
    if (dfsPtr >= _taskList.length) {
        results.push([...arrDFS]); // 深拷贝当前方案
    }
    else {
        for (let i = 0; i < _taskList.length; i++) {
            if (results.length >= MAX_PLANS) {
                return; // 超过最大方案数，返回
            }
            if (arrDFSChecked[i]) {
                continue; // 任务已完成，跳过
            }
            const task = _taskList[i];
            scheduleTask(task); // 调度任务
            if (!check()) {
                unScheduleTask(task); // 撤销调度
                continue; // 继续下一个任务
            }
            finishTask(task); // 完成任务
            arrDFSChecked[i] = true; // 标记任务为已完成
            arrDFS[dfsPtr] = i;
            dfsPtr++;
            do_dfs();
            dfsPtr--;
            unfinishTask(task); // 撤销完成
            arrDFSChecked[i] = false; // 标记任务为未完成
        }
    }
}
function dfs(taskList: Task[], resourceList: number[], resourceCount: number) {
    initDFS(taskList, resourceList, resourceCount); // 初始化DFS
    _taskList = taskList; // 任务列表
    do_dfs(); // 执行DFS
    return results; // 返回结果
}

export default {
    dfs,
}
