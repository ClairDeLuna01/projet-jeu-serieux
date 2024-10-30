import { Game } from "./game";

const game = new Game();

export class MainMenu {
    private startButton: HTMLElement;
    private optionsButton: HTMLElement;
    private creditsButton: HTMLElement;
    private howToPlayButton: HTMLElement;

    private mainMenu: HTMLElement;

    private creditsMenu: HTMLElement;
    private creditsBackButton: HTMLElement;

    private optionsMenu: HTMLElement;
    private optionsBackButton: HTMLElement;
    private optionsVolumeSlider: HTMLInputElement;
    private optionsVolumeSliderLabel: HTMLElement;
    private optionsFullscreenCheckbox: HTMLInputElement;

    private howToPlayMenu: HTMLElement;
    private howToPlayBackButton: HTMLElement;

    private gameOverMenu: HTMLElement;
    private gameOverRestartButton: HTMLElement;
    private gameOverMainMenuButton: HTMLElement;

    constructor() {
        this.startButton = document.getElementById("main-menu-start")!;
        this.optionsButton = document.getElementById("main-menu-options")!;
        this.creditsButton = document.getElementById("main-menu-credits")!;
        this.howToPlayButton = document.getElementById("main-menu-how-to-play")!;
        this.mainMenu = document.getElementById("main-menu")!;

        this.creditsMenu = document.getElementById("credits")!;
        this.creditsBackButton = document.getElementById("credits-back")!;

        this.optionsMenu = document.getElementById("options")!;
        this.optionsBackButton = document.getElementById("options-back")!;
        this.optionsVolumeSlider = document.getElementById("volume-slider") as HTMLInputElement;
        this.optionsVolumeSliderLabel = document.getElementById("volume-label")!;
        this.optionsFullscreenCheckbox = document.getElementById(
            "fullscreen-checkbox"
        ) as HTMLInputElement;

        this.howToPlayMenu = document.getElementById("how-to-play")!;
        this.howToPlayBackButton = document.getElementById("how-to-play-back")!;

        this.gameOverMenu = document.getElementById("game-over")!;
        this.gameOverRestartButton = document.getElementById("game-over-restart")!;
        this.gameOverMainMenuButton = document.getElementById("game-over-main-menu")!;

        this.optionsVolumeSlider.value = `${game.getVolume() * 100}`;
        this.updateVolume();

        this.startButton.addEventListener("click", () => this.startGame());
        this.optionsButton.addEventListener("click", () => this.openOptions());

        this.creditsButton.addEventListener("click", () => this.openCredits());
        this.creditsBackButton.addEventListener("click", () => this.closeCredits());

        this.optionsBackButton.addEventListener("click", () => this.closeOptions());
        this.optionsVolumeSlider.addEventListener("input", () => this.updateVolume());
        this.optionsFullscreenCheckbox.addEventListener("change", () => this.toggleFullscreen());

        this.howToPlayButton.addEventListener("click", () => this.openHowToPlay());
        this.howToPlayBackButton.addEventListener("click", () => this.closeHowToPlay());

        this.gameOverRestartButton.addEventListener("click", () => {
            this.gameOverMenu.classList.add("hide");
            game.play();
        });

        this.gameOverMainMenuButton.addEventListener("click", () => {
            this.gameOverMenu.classList.add("hide");
            this.mainMenu.classList.remove("hide");
        });
    }

    private startGame() {
        this.mainMenu.classList.add("hide");
        game.play();
    }

    private openOptions() {
        this.mainMenu.classList.add("hide");
        this.optionsMenu.classList.remove("hide");
    }

    private openCredits() {
        this.mainMenu.classList.add("hide");
        this.creditsMenu.classList.remove("hide");
    }

    private closeCredits() {
        this.creditsMenu.classList.add("hide");
        this.mainMenu.classList.remove("hide");
    }

    private closeOptions() {
        this.optionsMenu.classList.add("hide");
        this.mainMenu.classList.remove("hide");
    }

    private openHowToPlay() {
        this.mainMenu.classList.add("hide");
        this.howToPlayMenu.classList.remove("hide");
    }

    private closeHowToPlay() {
        this.howToPlayMenu.classList.add("hide");
        this.mainMenu.classList.remove("hide");
    }

    private updateVolume() {
        this.optionsVolumeSliderLabel.innerText = `${this.optionsVolumeSlider.value}%`;
        game.setVolume(parseInt(this.optionsVolumeSlider.value, 10) / 100);
    }

    private toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
            try {
                // @ts-ignore
                screen.orientation.lock("portrait-primary").catch((error: any) => {
                    console.log("Could not lock orientation: " + error);
                });
            } catch {
                // Do nothing
            }
        }
    }
}
