<template>
    <div class="d-flex" style="margin: 24px; justify-content: center; gap: 24px;">
        <div>
            <h1 style="text-align: center;">操作系统 · 页面置换模拟器</h1>
            <div style="height: 24px;"></div>
            <div class="d-flex flex-column" style="gap: 8px;">
                <div class="d-flex" style="gap: 8px; align-items: start;">
                    <v-card class="mx-auto" :hover="true">
                        <v-toolbar dense flat>
                            <v-toolbar-title>
                                <span class="text-subheading">新建任务</span>
                            </v-toolbar-title>
                            <v-btn icon="mdi-refresh" @click="onRegenerate" />
                        </v-toolbar>
                        <v-card-text class="d-flex flex-column" style="align-items: end;gap: 8px;">
                            <v-slider v-model="pageAllocationLength" min-width="400" :min="1" :max="100" :step="1"
                                class="ma-4" label="页面走向长度" hide-details>
                                <template v-slot:append>
                                    <v-text-field v-model="pageAllocationLength" density="compact" style="width: 80px"
                                        type="number" variant="outlined" hide-details></v-text-field>
                                </template>
                            </v-slider>
                            <v-slider v-model="memoryLength" min-width="400" :min="1" :max="20" :step="1" class="ma-4"
                                label="物理页面数" hide-details>
                                <template v-slot:append>
                                    <v-text-field v-model="memoryLength" density="compact" style="width: 80px"
                                        type="number" variant="outlined" hide-details></v-text-field>
                                </template>
                            </v-slider>
                            <v-slider v-model="pageTableLength" min-width="400" :min="1" :max="100" :step="1"
                                class="ma-4" label="虚存页面数" hide-details>
                                <template v-slot:append>
                                    <v-text-field v-model="pageTableLength" density="compact" style="width: 80px"
                                        type="number" variant="outlined" hide-details></v-text-field>
                                </template>
                            </v-slider>
                        </v-card-text>
                    </v-card>
                    <div class="d-flex flex-column" style="gap: 8px;">
                        <v-card width="150px" :hover="true">
                            <v-card-title class="text-h6 text-md-h5 text-lg-h4">
                                <NumberFlow :value="scheduleResult.length.toFixed(2)" />
                            </v-card-title>
                            <v-card-text>
                                缺页数
                            </v-card-text>
                        </v-card>
                        <v-card width="150px" :hover="true">
                            <v-card-title class="text-h6 text-md-h5 text-lg-h4">
                                <NumberFlow :value="(scheduleResult.length / pageAllocationLength).toFixed(4)" />
                            </v-card-title>
                            <v-card-text>
                                缺页率
                            </v-card-text>
                        </v-card>
                    </div>
                    <v-select label="调度器选择" v-model="selectedScheduler" :items="scheduler.getSchedulerList()"
                        @update:model-value="setScheduler(selectedScheduler)"></v-select>
                </div>
                <TransitionGroup tag="div" name="fade" class="d-flex" style="gap: 8px;">
                    <div v-for="(task, idx) in allocationList" :key="idx">
                        <v-card variant="elevated" class="mx-auto ma-2" :color="Utils.getColor(task)" :title="task"
                            style="width: 50px;" :hover="true">
                        </v-card>
                    </div>
                </TransitionGroup>
                <hr />
                <div v-for="(memory, index) in memoryList" :key="index" class="d-flex"
                    style="gap: 16px; align-items: center;">
                    <TransitionGroup tag="div" name="fade" class="d-flex" style="gap: 8px;">
                        <div v-for="(memoryItem, idx) in memory" :key="memoryItem">
                            <v-card variant="elevated" class="mx-auto ma-2" :color="Utils.getColor(memoryItem[0])"
                                :title="memoryItem[0] == -1 ? '空' : memoryItem[0]" :hover="true"
                                :style="{ width: `${50 * memoryItem[1] + 8 * (memoryItem[1] - 1)}px` }">
                            </v-card>
                        </div>
                    </TransitionGroup>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import NumberFlow from '@number-flow/vue'

import scheduler from "@/controllers/Scheduler";
import Utils from "./controllers/Utils";
import { ref } from "vue";


const allocationList = ref([]);
const memoryList = ref([]);
/// UI相关
// 根据调度结果创建内存状态列表
function generateMemoryList(scheduleResult) {
    let newMemoryList = [];
    newMemoryList.length = memoryLength.value;
    for (let i = 0; i < memoryLength.value; i++) {
        newMemoryList[i] = [];
    }
    for (let memoryID = 0; memoryID < memoryLength.value; memoryID++) {
        let lastEnterTime = 0;
        let lastEnterID = -1;
        for (const element of scheduleResult) {
            if (element.index != memoryID) continue;
            if (element.time - lastEnterTime != 0)
                newMemoryList[memoryID].push([element.before, element.time - lastEnterTime]);
            lastEnterTime = element.time;
            lastEnterID = element.after;
        }
        if (pageAllocationLength.value - lastEnterTime > 0)
            newMemoryList[memoryID].push([lastEnterID, allocationList.value.length - lastEnterTime]);
    }
    memoryList.value.length = memoryLength.value;
    for (let i = 0; i < memoryLength.value; i++) {
        memoryList.value[i] = newMemoryList[i];
    }
}

// 任务创建相关（由vue modal修改）
const pageAllocationLength = ref(14);
const pageTableLength = ref(4);
const memoryLength = ref(3);

// 生成页面走向，存储于tasksList
function generateRandonList() {
    try {
        let _pageAllocationLength = pageAllocationLength.value;
        let _pageTableLength = pageTableLength.value;
        let _memoryLength = memoryLength.value;
        if (_pageAllocationLength < 1) _pageAllocationLength = 1;
        if (_pageAllocationLength > 100) _pageAllocationLength = 100;
        if (_pageTableLength < 1) _pageTableLength = 1;
        if (_pageTableLength > 100) _pageTableLength = 100;
        if (_memoryLength < 1) memoryLength = 1;
        if (_memoryLength > 20) memoryLength = 20;
        pageAllocationLength.value = _pageAllocationLength;
        pageTableLength.value = _pageTableLength;
        memoryLength.value = _memoryLength;
        allocationList.value.length = 0;
        for (let i = 0; i < _pageAllocationLength; i++) {
            allocationList.value.push(Math.floor(Math.random() * _pageTableLength) + 1);
        }
    }
    catch (e) {
        console.log(e);
    }
}

// 任务调度相关
const selectedScheduler = ref(scheduler.getSchedulerList()[1]);
const scheduleResult = ref([]);
function reSchedule() {
    scheduleResult.value = scheduler.schedule(allocationList.value, memoryLength.value);
    generateMemoryList(scheduleResult.value);
}

function setScheduler(name) {
    scheduler.setScheduler(name);
    reSchedule();
}

function onRegenerate() {
    generateRandonList();
    reSchedule();
}

// 初始化
onRegenerate();
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
