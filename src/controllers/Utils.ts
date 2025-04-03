var colors = [
    "red",
    "pink",
    "purple",
    "deep-purple",
    "indigo",
    "blue",
    "light-blue",
    "cyan",
    "teal",
    "green",
    "light-green",
    "lime",
    "yellow",
    "amber",
    "orange",
    "deep-orange",
    "brown",
    "blue-grey",
];

function getColor(id: number) {
    return colors[id % colors.length] + "-lighten-1";
}

function getTimeString(time: number) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

export default {
    getColor,
    getTimeString,
};
