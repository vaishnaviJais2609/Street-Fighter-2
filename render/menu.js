let currentScene = "menu";

export function goTo(scene) {
    currentScene = scene;
}

export function getCurrentScene() {
    return currentScene;
}