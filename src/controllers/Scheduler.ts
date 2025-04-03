import type { Task, ScheduledTask } from "@/models/Task";

function scheduleOneHRN(tasks: Array<Task>, currentTime: number): [number, Task | undefined] {
    var task: Task | undefined = undefined;
    var scheduledID = -1;
    var maxResponseRatio = Number.MIN_VALUE;
    var minDuration = Number.MAX_VALUE;
    var minDurationID = -1;
    for (let i = 0; i < tasks.length; i++) {
        const element = tasks[i];
        if (element.enter > currentTime) {
            continue;
        }
        const responseRatio = (element.duration + currentTime - element.enter) / element.duration;
        if (responseRatio > maxResponseRatio) {
            maxResponseRatio = responseRatio;
            scheduledID = i;
            task = element;
        }
        if (element.duration < minDuration) {
            minDuration = element.duration;
            minDurationID = i;
        }
    }
    if (maxResponseRatio == 1) {
        scheduledID = minDurationID;
        task = tasks[scheduledID];
    }
    return [scheduledID, task];
}

function scheduleOneFCFS(tasks: Array<Task>, currentTime: number): [number, Task | undefined] {
    var task: Task | undefined = undefined;
    var scheduledID = -1;
    var minEnterTime = Number.MAX_VALUE;
    for (let i = 0; i < tasks.length; i++) {
        const element = tasks[i];
        if (element.enter > currentTime) {
            continue;
        }
        if (element.enter < minEnterTime) {
            minEnterTime = element.enter;
            scheduledID = i;
            task = element;
        }
    }
    return [scheduledID, task];
}

function scheduleOneSJF(tasks: Array<Task>, currentTime: number): [number, Task | undefined] {
    var task: Task | undefined = undefined;
    var scheduledID = -1;
    var minDuration = Number.MAX_VALUE;
    for (let i = 0; i < tasks.length; i++) {
        const element = tasks[i];
        if (element.enter > currentTime) {
            continue;
        }
        if (element.duration < minDuration) {
            minDuration = element.duration;
            scheduledID = i;
            task = element;
        }
    }
    return [scheduledID, task];
}

const schedulers = [
    scheduleOneFCFS,
    scheduleOneHRN,
    scheduleOneSJF,
]

const schedulerNames = [
    "先来先服务 (FCFS)",
    "高响应比优先 (HRN)",
    "最短作业优先 (SJF)",
]

var scheduler = schedulers[1];
function setScheduler(schedulerName: string) {
    var index = schedulerNames.indexOf(schedulerName);
    if (index >= 0) {
        scheduler = schedulers[index];
    } else {
        scheduler = schedulers[1];
    }
}

function getSchedulerList() {
    return schedulerNames;
}

function schedule(taskList: Array<Task>): Array<ScheduledTask> {
    var scheduledTasks: Array<ScheduledTask> = [];
    var currentTime = Number.MAX_VALUE;
    var minEnterTime = Number.MAX_VALUE;
    var taskCopy = [...taskList];
    // 找到调度开始时间
    taskCopy.forEach(element => {
        if (element.enter < currentTime) {
            currentTime = element.enter;
        }
    });
    // 调度任务
    while (taskCopy.length > 0) {
        minEnterTime = Number.MAX_VALUE;
        taskCopy.forEach(element => {
            if (element.enter < minEnterTime) {
                minEnterTime = element.enter;
            }
        });
        if (minEnterTime > currentTime) {
            currentTime = minEnterTime;
        }
        // var [scheduledID, task] = scheduleOne(taskCopy, currentTime);
        var [scheduledID, task] = scheduler(taskCopy, currentTime);
        if (task) {
            scheduledTasks.push({
                id: task.id,
                enter: task.enter,
                duration: task.duration,
                schInfo: {
                    start: currentTime,
                }
            });
            currentTime += task.duration;
            taskCopy.splice(scheduledID, 1);
        } else {
            break;
        }
    }
    // 返回调度结果
    return scheduledTasks;
}

function getAverageTurnaroundTime(scheduledTasks: Array<ScheduledTask>): number {
    if (scheduledTasks.length == 0) {
        return 0;
    }
    var totalTurnaroundTime = 0;
    scheduledTasks.forEach(element => {
        totalTurnaroundTime += element.schInfo.start + element.duration - element.enter;
    });
    return totalTurnaroundTime / scheduledTasks.length;
}

function getAverageWeightedTurnaroundTime(scheduledTasks: Array<ScheduledTask>): number {
    if (scheduledTasks.length == 0) {
        return 0;
    }
    var totalWeightedTurnaroundTime = 0;
    scheduledTasks.forEach(element => {
        totalWeightedTurnaroundTime += (element.schInfo.start + element.duration - element.enter) / element.duration;
    });
    return totalWeightedTurnaroundTime / scheduledTasks.length;
}

export default {
    setScheduler,
    getSchedulerList,
    schedule,
    getAverageTurnaroundTime,
    getAverageWeightedTurnaroundTime,
};