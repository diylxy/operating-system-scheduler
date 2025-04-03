
type Task = {
    id: number;
    enter: number;
    duration: number;
};
type ScheduledTask = {
    id: number;
    enter: number;
    duration: number;
    schInfo: {
        start: number;
    }
};

export type { Task, ScheduledTask };
