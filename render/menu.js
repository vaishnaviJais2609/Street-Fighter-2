let currentScene = "menu";

export const MENU_ITEMS = [
    { id: "start", label: "START GAME" },
    { id: "multiplayer", label: "MULTI PLAYER" },
    { id: "character-select", label: "CHARACTER SELECT" },
    { id: "background-select", label: "BACKGROUND SELECT" },
    { id: "instructions", label: "INSTRUCTIONS" }
];

let selectedIndex = 0;

export function goTo(scene) {
    currentScene = scene;
}

export function getCurrentScene() {
    return currentScene;
}

export function getSelectedIndex() {
    return selectedIndex;
}

export function setSelectedIndex(index) {
    if (index >= 0 && index < MENU_ITEMS.length) {
        selectedIndex = index;
    }
}

export function moveSelection(delta) {
    const total = MENU_ITEMS.length;
    selectedIndex = (selectedIndex + delta + total) % total;
    return selectedIndex;
}