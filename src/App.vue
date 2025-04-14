<template>
    <github-corners fixed target="__blank" href="https://github.com/uivjs/vue-github-corners" />
    <div class="d-flex" style="margin: 24px; justify-content: center; gap: 24px;">
        <div>
            <h1 style="text-align: center;">操作系统 · 银行家算法</h1>
            <div style="height: 24px;"></div>
            <div class="d-flex flex-column" style="gap: 8px;">
                <v-card class="mx-auto" :hover="true" min-width="400">
                    <v-toolbar dense flat>
                        <v-toolbar-title>
                            <span class="text-subheading">操作系统配置</span>
                        </v-toolbar-title>
                        <v-btn icon="mdi-check" @click="doSchedule"></v-btn>
                    </v-toolbar>
                    <v-card-text>
                        <div>
                            <h3 class="text-center text-h6">有效的资源 Avaliable</h3>
                            <div class="d-flex justify-center ga-2">
                                <v-text-field label="" variant="outlined" style="max-width: 60px;"
                                    v-for="(idx, index) in Array(resourceCount).fill(0)" :key="index"
                                    v-model="OSRes[index]" type="number" hide-spin-buttons></v-text-field>
                            </div>
                        </div>
                        <v-slider v-model="resourceCount" :min="1" :max="MAX_RESOURCES_COUNT" :step="1" class="ma-4"
                            label="资源种类" hide-details thumb-label show-ticks>
                        </v-slider>
                    </v-card-text>
                </v-card>
                <v-card class="mx-auto" :hover="true" min-width="400">
                    <v-toolbar dense flat>
                        <v-toolbar-title>
                            <span class="text-subheading">新建任务</span>
                        </v-toolbar-title>
                        <v-btn icon="mdi-delete" color="red" @click="clearTasks"></v-btn>
                        <v-btn icon="mdi-plus" @click="addTask" />
                    </v-toolbar>
                    <v-card-text>
                        <div>
                            <h3 class="text-center text-h6">最大需求 Max</h3>
                            <div class="d-flex justify-center ga-2">
                                <v-text-field label="" variant="outlined" style="max-width: 60px;"
                                    v-for="(idx, index) in Array(resourceCount).fill(0)" :key="index"
                                    v-model="inputResMax[index]" type="number" hide-spin-buttons></v-text-field>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-center text-h6">已分配资源 Allocation</h3>
                            <div class="d-flex justify-center ga-2">
                                <v-text-field variant="outlined" style="max-width: 60px"
                                    v-for="(idx, index) in Array(resourceCount).fill(0)" :key="index"
                                    v-model="inputRes[index]" type="number" hide-spin-buttons></v-text-field>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>

                <TransitionGroup tag="div" name="squeeze">
                    <div v-for="task in tasksList" :key="task.id">
                        <v-card variant="elevated" class="mx-auto ma-2" :color="Utils.getColor(task.id)" min-width="400"
                            :title="'任务 ' + task.id" :hover="true" @click="deleteTask(task.id)">
                            <template v-slot:append>
                                <v-btn icon="mdi-delete" @click="deleteTask(task.id)"></v-btn>
                            </template>
                            <template v-slot:subtitle>
                                <div>最大需求: {{ task.resMax.slice(0, resourceCount) }}</div>
                                <div>当前分配: {{ task.res.slice(0, resourceCount) }}</div>
                            </template>
                        </v-card>
                    </div>
                </TransitionGroup>
            </div>
        </div>
        <div>
            <div class="d-flex justify-center ga-2 mb-6" style="text-align: center;">
                <v-card width="120px" :hover="true" class="pt-4" :color="isSafe ? 'green-darken-4' : 'red-darken-4'">
                    <Transition name="fade" mode="out-in">
                        <div v-if="isSafe === false">
                            <v-icon size="48">mdi-shield-alert</v-icon>
                            <v-card-text> 非安全 </v-card-text>
                        </div>
                        <div v-else>
                            <v-icon size="48">mdi-shield-check</v-icon>
                            <v-card-text> 安全 </v-card-text>
                        </div>
                    </Transition>
                </v-card>
                <v-card width="200px" :hover="true">
                    <v-card-title class="text-h4">
                        <NumberFlow :value="schemeCount" />
                    </v-card-title>
                    <v-card-text>
                        总方案数
                    </v-card-text>
                </v-card>
            </div>
            <div class="d-flex justify-center ga-2 mb-2 flex-column">
                <div key="card1">
                    <v-card width="320px" :hover="true">
                        <v-toolbar dense flat>
                            <v-toolbar-title>
                                <span class="text-subheading">最大需求 Max</span>
                            </v-toolbar-title>
                        </v-toolbar>
                        <v-card-text>
                            <v-table density="compact">
                                <tbody>
                                    <TransitionGroup name="slide">
                                        <tr v-for="task in tasksList" :key="task.id">
                                            <td><strong>任务 {{ task.id }}</strong></td>
                                            <td v-for="(value, index) in task.resMax.slice(0, resourceCount)"
                                                :key="index">
                                                {{
                                                    value }}
                                            </td>
                                        </tr>
                                    </TransitionGroup>
                                </tbody>
                            </v-table>
                        </v-card-text>
                    </v-card>
                </div>
                <div key="card2">
                    <v-card width="320px" :hover="true">
                        <v-toolbar dense flat>
                            <v-toolbar-title>
                                <span class="text-subheading">已分配资源 Allocation</span>
                            </v-toolbar-title>
                        </v-toolbar>
                        <v-card-text>
                            <v-table density="compact">
                                <tbody>
                                    <TransitionGroup name="slide">
                                        <tr v-for="task in tasksList" :key="task.id">
                                            <td><strong>任务 {{ task.id }}</strong></td>
                                            <td v-for="(value, index) in task.res.slice(0, resourceCount)" :key="index">
                                                {{
                                                    value }}
                                            </td>
                                        </tr>
                                    </TransitionGroup>
                                </tbody>
                            </v-table>
                        </v-card-text>
                    </v-card>
                </div>
                <div>
                    <div class="d-flex flex-column ga-1">
                        <TransitionGroup name="slide">
                            <div v-for="(scheme, index) in schemesDisplay" :key="index">
                                <v-card class="d-flex" max-width="400" :hover="true">
                                    <v-card class="ma-1 pa-1 px-2" v-for="task in scheme" :key="task"
                                        :color="Utils.getColor(task)">
                                        {{ task }}
                                    </v-card>
                                </v-card>
                            </div>
                        </TransitionGroup>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import NumberFlow from '@number-flow/vue'
import Utils from "./controllers/Utils";
import { ref } from "vue";

const MAX_RESOURCES_COUNT = 5;

const OSRes = ref([3, 14, 12, 12, 0, 0]);          // 操作系统拥有的资源

const isSafe = ref(true);
const schemes = ref([]);
const schemeCount = ref(0);
const schemesDisplay = ref([]);
const resourceCount = ref(4);

const tasksList = ref([
    {
        id: 1,
        res: [0, 0, 1, 2, 0, 0],
        resMax: [0, 0, 1, 2, 0, 0],
    },
    {
        id: 2,
        res: [1, 0, 0, 0, 0, 0],
        resMax: [1, 7, 5, 0, 0, 0],
    },
    {
        id: 3,
        res: [1, 3, 5, 4, 0, 0],
        resMax: [2, 3, 5, 6, 0, 0],
    },
    {
        id: 4,
        res: [0, 6, 3, 2, 0, 0],
        resMax: [0, 6, 5, 2, 0, 0],
    },
    {
        id: 5,
        res: [0, 0, 1, 4, 0, 0],
        resMax: [0, 6, 5, 6, 0, 0],
    },
]);


// 任务创建相关
const inputRes = ref([0, 0, 0, 0, 0, 0]);
const inputResMax = ref([0, 0, 0, 0, 0, 0]);


function addTask() {
    let maxID = 0;
    tasksList.value.forEach((task) => {
        if (task.id > maxID) {
            maxID = task.id;
        }
    });
    const task = {
        id: maxID + 1,
        res: inputRes.value.map(value => parseInt(value, 10)),
        resMax: inputResMax.value.map(value => parseInt(value, 10)),
    };
    tasksList.value.push(task);
    doSchedule();
}

function deleteTask(id) {
    const index = tasksList.value.findIndex(task => task.id === id);
    if (index !== -1) {
        tasksList.value.splice(index, 1);
    }
    doSchedule();
}

function clearTasks() {
    tasksList.value = [];
    schemes.value = [];
    schemesDisplay.value = [];
    schemeCount.value = 0;
    isSafe.value = true;
}

import BruteForceBanker from './controllers/BruteForceBanker';

function doSchedule() {
    if (tasksList.value.length == 0) {
        isSafe.value = true;
        schemesDisplay.value = [];
        return;
    }
    let results = BruteForceBanker.dfs(tasksList.value, OSRes.value, resourceCount.value);
    if (results.length == 0) {
        isSafe.value = false;
        schemes.value = [];
        schemesDisplay.value = [];
    } else {
        isSafe.value = true;
        schemes.value = results.map((item) => {
            return item.map((task) => tasksList.value[task].id);
        });
        schemeCount.value = schemes.value.length;
        if (schemeCount.value >= 10000) {
            schemeCount.value = Number.POSITIVE_INFINITY;
        }
        schemesDisplay.value = schemes.value.slice(0, 50);
    }
}
doSchedule();
</script>

<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.squeeze-move,
.squeeze-enter-active,
.squeeze-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.squeeze-enter-from,
.squeeze-leave-to {
    opacity: 0;
    transform: scaleY(0.01) translate(30px, 0);
}

.squeeze-leave-active {
    position: absolute;
}

.slide-move,
.slide-enter-active,
.slide-leave-active {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.slide-enter-from,
.slide-leave-to {
    opacity: 0;
    transform: translateX(-100%);
}
</style>
