import speech1 from "../letters/speech1.txt";
import speech2 from "../letters/speech2.txt";
import { CardEffect } from "./card";
import { Game } from "./game";
import { isAsciiPrintable } from "./utils";

export class TypingMinigame {
    private text: string;
    private textClean: string;
    private textIndex: number;
    private textElement: HTMLElement;
    private letterElements: HTMLElement[];
    private WPMElem: HTMLElement;
    private game: Game;
    private eventCallback: (event: KeyboardEvent) => void;
    private typingStartTimestamp = -1;

    private winEffect: CardEffect;
    private loseEffect: CardEffect;

    constructor(text: string, winEffect: CardEffect, loseEffect: CardEffect) {
        this.text = text;
        this.winEffect = winEffect;
        this.loseEffect = loseEffect;
        this.textClean = text.replace(/\n/g, "");
        this.textIndex = 0;
        this.textElement = document.getElementById("typing-minigame-text")!;
        this.WPMElem = document.getElementById("typing-minigame-wpm-value")!;
        this.letterElements = [];

        // console.log("text", text);
    }

    typing(event: KeyboardEvent) {
        const letter = this.textClean[this.textIndex];

        // console.log(this.textIndex);
        // console.log(this);

        const secret_cheat_key = "`";

        if (isAsciiPrintable(event.key)) {
            if (this.textIndex === 0) {
                this.typingStartTimestamp = Date.now();
            }

            const printKey = event.key === secret_cheat_key ? letter : event.key;
            if (event.key === letter || event.key === secret_cheat_key) {
                this.letterElements[this.textIndex].classList.add("correct");
            } else {
                this.letterElements[this.textIndex].classList.add("wrong");
            }

            this.letterElements[this.textIndex].classList.remove("reverse");
            this.letterElements[this.textIndex].classList.add("active");

            this.letterElements[this.textIndex].innerHTML = printKey === " " ? "&nbsp;" : printKey;

            this.textIndex++;
        } else if (event.key === "Backspace") {
            if (this.textIndex > 0) {
                this.textIndex--;
                this.letterElements[this.textIndex].classList.remove("active");
                this.letterElements[this.textIndex].classList.remove("correct");
                this.letterElements[this.textIndex].classList.remove("wrong");
                this.letterElements[this.textIndex].classList.add("reverse");
                this.letterElements[this.textIndex].innerHTML =
                    this.textClean[this.textIndex] === " "
                        ? "&nbsp;"
                        : this.textClean[this.textIndex];
            }
        } else if (event.key === "Enter") {
            if (letter === "\n") {
                this.textIndex++;
            }
        } else if (event.key === "Escape") {
            this.textIndex = this.textClean.length;
        }
    }

    getWPM() {
        const elapsedSeconds = (Date.now() - this.typingStartTimestamp) / 1000;
        if (elapsedSeconds < 0.1) {
            return 0;
        }
        const elapsedMinutes = elapsedSeconds / 60;
        const wordLength = 5;
        const charWritten = this.textIndex;
        return Math.round(charWritten / wordLength / elapsedMinutes);
    }

    updateWPM(wpm: number) {
        this.WPMElem.textContent = wpm.toString();

        if (wpm === 0) return;

        // shaking effect based on wpm
        const shakeX = ((Math.random() * 2 - 1) * wpm) / 20;
        const shakeY = ((Math.random() * 2 - 1) * wpm) / 20;
        const shakeAngle = (Math.random() * 2 - 1) * (wpm / 1000);
        const shakeScale = wpm / 1000 + 1;
        this.WPMElem.style.transform = `translate(${shakeX}px, ${shakeY}px) rotate(${shakeAngle}rad) scale(${shakeScale})`;
        this.WPMElem.style.color = `hsl(${wpm + 180}, 100%, 50%)`;
        this.WPMElem.style.textShadow = `0 0 5px hsl(${wpm + 180}, 100%, 50%)`;
    }

    setGame(game: Game) {
        this.game = game;
    }

    setText() {
        this.text.split("\n").forEach((line) => {
            if (line === "") {
                const newLineElement = document.createElement("br");
                this.textElement.appendChild(newLineElement);
                return;
            }

            const paragraphElement = document.createElement("div");
            paragraphElement.classList.add("typing-minigame-paragraph");
            line.split(" ").forEach((word, index) => {
                const wordElement = document.createElement("div");
                wordElement.classList.add("typing-minigame-word");

                word.split("").forEach((letter) => {
                    const letterElement = document.createElement("span");
                    letterElement.classList.add("typing-minigame-letter");
                    letterElement.textContent = letter;
                    wordElement.appendChild(letterElement);
                    this.letterElements.push(letterElement);
                });

                paragraphElement.appendChild(wordElement);

                if (index !== line.split(" ").length - 1) {
                    const spaceElement = document.createElement("span");
                    spaceElement.classList.add("typing-minigame-letter");
                    spaceElement.innerHTML = "&nbsp;";
                    paragraphElement.appendChild(spaceElement);

                    this.letterElements.push(spaceElement);
                }
            });
            this.textElement.appendChild(paragraphElement);
        });

        // console.log("letterElements", this.letterElements);
    }

    start() {
        this.setText();

        this.eventCallback = this.typing.bind(this);
        document.addEventListener("keydown", this.eventCallback);
    }

    isDone() {
        return this.textIndex === this.textClean.length;
    }

    isWin() {
        return this.getWPM() > 40;
    }

    getErrorCount() {
        return this.letterElements.filter((e) => e.classList.contains("wrong")).length;
    }

    async waitTilDone() {
        while (!this.isDone()) {
            if (this.typingStartTimestamp !== -1) {
                this.updateWPM(this.getWPM());
            }

            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        document.removeEventListener("keydown", this.eventCallback);

        const errors = this.getErrorCount();

        this.winEffect.employeesModifier = (this.winEffect.employeesModifier ?? 0) + errors * 0.01;
        this.winEffect.publicPerceptionModifier =
            (this.winEffect.publicPerceptionModifier ?? 0) + errors * 0.01;
        this.winEffect.shareholdersModifier =
            (this.winEffect.shareholdersModifier ?? 0) + errors * 0.01;

        this.loseEffect.employeesModifier =
            (this.loseEffect.employeesModifier ?? 0) - errors * 0.01;
        this.loseEffect.publicPerceptionModifier =
            (this.loseEffect.publicPerceptionModifier ?? 0) - errors * 0.01;
        this.loseEffect.shareholdersModifier =
            (this.loseEffect.shareholdersModifier ?? 0) - errors * 0.01;

        this.game.applyCardEffect(this.isWin() ? this.winEffect : this.loseEffect);
    }
}

export const typingMinigames: { [key: string]: TypingMinigame } = {
    shareholders: new TypingMinigame(
        speech1,
        {
            text: "",
            shareholdersModifier: -0.5,
        },
        {
            text: "",
            shareholdersModifier: 0.5,
        }
    ),
    consumers: new TypingMinigame(
        speech2,
        {
            text: "",
            publicPerceptionModifier: -0.5,
        },
        {
            text: "",
            publicPerceptionModifier: 0.5,
        }
    ),
};
