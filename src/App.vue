<template>
    <github-corners fixed target="__blank" href="https://github.com/uivjs/vue-github-corners" />
    <div class="d-flex" style="margin: 24px; justify-content: center; gap: 24px;">
        <div>
            <h1 style="text-align: center;">操作系统 · 调度模拟器</h1>
            <div style="height: 24px;"></div>
            <v-select label="调度器选择" v-model="selectedScheduler" :items="HRNscheduler.getSchedulerList()"
                @update:model-value="setScheduler(selectedScheduler)"></v-select>
            <div class="d-flex flex-column" style="gap: 8px;">
                <v-card class="mx-auto" :hover="true" min-width="400">
                    <v-toolbar dense flat>
                        <v-toolbar-title>
                            <span class="text-subheading">新建任务</span>
                        </v-toolbar-title>
                        <v-btn icon="mdi-delete" color="red" @click="clearTask"></v-btn>
                        <v-btn icon="mdi-plus" @click="addTask" />
                    </v-toolbar>
                    <v-card-text>
                        <div>
                            <h3 class="text-center text-h6">提交时间</h3>
                            <v-otp-input :length="4" max-width="240px" :focus-all="true" v-model="newTaskCreateTime"
                                :error="newTaskHasError" @keydown.enter="addTask"></v-otp-input>
                        </div>
                        <v-slider v-model="newTaskRuntime" :min="5" :max="100" :step="5" class="ma-4" label="预计运行"
                            hide-details>
                            <template v-slot:append>
                                <v-text-field v-model="newTaskRuntime" density="compact" style="width: 80px"
                                    type="number" variant="outlined" hide-details></v-text-field>
                            </template>
                        </v-slider>
                    </v-card-text>
                </v-card>

                <TransitionGroup tag="div" name="fade">
                    <div v-for="task in tasksList" :key="task.id">
                        <v-card variant="elevated" class="mx-auto ma-2" :color="Utils.getColor(task.id)" min-width="400"
                            :title="'任务 ' + task.id" :hover="true" @click="deleteTask(task.id)">
                            <template v-slot:append>
                                <v-btn icon="mdi-delete" @click="deleteTask(task.id)"></v-btn>
                            </template>
                            <template v-slot:subtitle>
                                <div>进入时间: {{ Utils.getTimeString(task.enter) }}</div>
                                <div>预计运行: {{ task.duration }} 分钟</div>
                            </template>
                        </v-card>
                    </div>
                </TransitionGroup>
            </div>
        </div>
        <div>
            <div class="d-flex justify-center ga-2 mb-6" style="text-align: center;">
                <v-card width="200px" :hover="true">
                    <v-card-title class="text-h6 text-md-h5 text-lg-h4">
                        <NumberFlow :value="avgTurnaroundTime.toFixed(1)" />
                    </v-card-title>
                    <v-card-text>
                        平均周转时间
                    </v-card-text>
                </v-card>
                <v-card width="160px" :hover="true">
                    <v-card-title class="text-h6 text-md-h5 text-lg-h4">
                        <NumberFlow :value="avgWeightedTurnaroundTime.toFixed(2)" />
                    </v-card-title>
                    <v-card-text>
                        平均带权周转时间
                    </v-card-text>
                </v-card>
            </div>
            <TimeLine :scheduleList="scheduleList" />
        </div>
    </div>
</template>

<script setup>
import NumberFlow from '@number-flow/vue'

import TimeLine from "@/components/TimeLine.vue";
import HRNscheduler from "@/controllers/Scheduler";
import Utils from "./controllers/Utils";
import { ref } from "vue";


const tasksList = ref([
    {
        id: 1,
        enter: 10 * 60 + 10,
        duration: 30,
    },
    {
        id: 2,
        enter: 10 * 60 + 10,
        duration: 20,
    },
    {
        id: 3,
        enter: 10 * 60 + 20,
        duration: 45,
    },
    {
        id: 4,
        enter: 10 * 60 + 20,
        duration: 25,
    },
    {
        id: 5,
        enter: 10 * 60 + 15,
        duration: 50,
    },
]);

const scheduleList = ref([]);
const avgTurnaroundTime = ref(0);
const avgWeightedTurnaroundTime = ref(0);

// 任务创建相关
const newTaskCreateTime = ref(null);
const newTaskRuntime = ref(5);
const newTaskHasError = ref(false);

function getNewTaskEnterTime() {
    if (newTaskCreateTime.value === null) {
        newTaskHasError.value = true;
        return null;
    }
    const time_bcd = Number.parseInt(newTaskCreateTime.value);
    const time_hr = Math.floor(time_bcd / 100);
    const time_min = time_bcd % 100;
    if (time_hr < 0 || time_hr > 24 || time_min < 0 || time_min > 59) {
        newTaskHasError.value = true;
        return null;
    }
    const time = time_hr * 60 + time_min;
    if (time < 0 || time > 24 * 60) {
        newTaskHasError.value = true;
        return null;
    }
    newTaskHasError.value = false;
    return time;
}

function getMaxTaskid() {
    if (tasksList.value.length === 0) {
        return 0;
    }
    return Math.max(...tasksList.value.map(t => t.id));
}

function addTask() {
    const enterTime = getNewTaskEnterTime();
    if (enterTime === null) {
        return;
    }
    const task = {
        id: getMaxTaskid() + 1,
        enter: enterTime,
        duration: Number.parseInt(newTaskRuntime.value),
    };
    tasksList.value.push(task);
    reSchedule();
}

function deleteTask(id) {
    tasksList.value = tasksList.value.filter(t => t.id !== id);
    reSchedule();
}

function clearTask() {
    tasksList.value = [];
    scheduleList.value = [];
    avgTurnaroundTime.value = 0;
    avgWeightedTurnaroundTime.value = 0;
}

// 任务调度相关
const selectedScheduler = ref(HRNscheduler.getSchedulerList()[1]);
function reSchedule() {
    scheduleList.value = HRNscheduler.schedule(tasksList.value);
    avgTurnaroundTime.value = HRNscheduler.getAverageTurnaroundTime(scheduleList.value);
    avgWeightedTurnaroundTime.value = HRNscheduler.getAverageWeightedTurnaroundTime(scheduleList.value);
}

function setScheduler(name) {
    HRNscheduler.setScheduler(name);
    reSchedule();
}

// 初始化
reSchedule();
</script>

<style scoped>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
    position: absolute;
}
</style>
