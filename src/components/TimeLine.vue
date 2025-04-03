<template>
    <TransitionGroup tag="div" name="list">
        <div v-for="(item, index) in scheduleList" :key="item.id">
            <v-timeline align="start" side="end" truncate-line="start">
                <v-timeline-item :dot-color="Utils.getColor(item.id)">
                    <template #icon>
                        {{ index + 1 }}
                    </template>
                    <div>
                        <div class="d-flex">
                            <div class="me-4">
                                <strong>任务 {{ item.id }}</strong>
                            </div>
                            <strong class="me-4">
                                {{ Utils.getTimeString(item.schInfo.start) }} - {{
                                    Utils.getTimeString(item.schInfo.start +
                                        item.duration)
                                }}
                            </strong>
                        </div>
                        <div style="padding-left: 30px; min-width: 300px;">
                            <div>
                                <span class="text-caption">
                                    进入时间:
                                </span>
                                <span class="text-caption">
                                    <strong> {{ Utils.getTimeString(item.enter) }} </strong>
                                </span>
                            </div>
                            <div>
                                <span class="text-caption">
                                    执行时间:
                                </span>
                                <span class="text-caption">
                                    <strong> {{ item.duration }} 分钟 </strong>
                                </span>
                            </div>
                            <div>
                                <span class="text-caption">
                                    周转时间:
                                </span>
                                <span class="text-caption">
                                    <strong> {{ item.duration + (item.schInfo.start - item.enter) }} 分钟 </strong>
                                </span>
                            </div>
                            <div>
                                <span class="text-caption">
                                    带权周转时间:
                                </span>
                                <span class="text-caption">
                                    <strong> {{ ((item.duration + (item.schInfo.start - item.enter)) /
                                        item.duration).toFixed(2)
                                    }}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </v-timeline-item>
            </v-timeline>
        </div>
    </TransitionGroup>
</template>

<script setup lang="ts">
import type { ScheduledTask } from "@/models/Task";
import Utils from "@/controllers/Utils";
defineProps({
    scheduleList: {
        type: Array as () => Array<ScheduledTask>,
        default: () => [],
    },
});


</script>

<style scoped>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.8s cubic-bezier(0.55, 0, 0.1, 1);
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

.list-move,
/* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateX(30px) scale(0.7);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(30px) scale(0.7);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
    position: absolute;
}
</style>