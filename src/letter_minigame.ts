import letter1 from "../letters/letter1.txt";
import letter2 from "../letters/letter2.txt";
import letter3 from "../letters/letter3.txt";
import { CardEffect } from "./card";
import { Game } from "./game";

export class LetterMinigame {
    public letterRaw: string;
    public letterHTML: string;
    public blanks: string[];

    private letterBodyElement: HTMLElement;
    private letterInputElement: HTMLElement;
    private blankElements: HTMLElement[];
    private guessElements: HTMLElement[];

    private effectGood: CardEffect;
    private effectBad: CardEffect;

    private currentBlankIndex = 0;

    private game: Game;

    private wrongBlanks: string[] = [
        "money",
        "$$$",
        "bill Gates",
        "nothing",
        "great things!",
        "nullisoft",
        "game City",
        "our brainwashed consumers",
        "have nothing to worry about",
        "our competitors",
        "our future",
        "please leave us alone",
        "prioritize our shareholders",
        "our shareholders",
        "never talk to me ever again",
        ":D",
    ];

    constructor(letterRaw: string, effectGood: CardEffect, effectBad: CardEffect) {
        this.letterRaw = letterRaw;
        this.effectGood = effectGood;
        this.effectBad = effectBad;
        this.blanks = [];
        this.blankElements = [];
        this.guessElements = [];

        this.processLetter();

        this.letterBodyElement = document.getElementById("letter-minigame-text")!;
        this.letterInputElement = document.getElementById("letter-minigame-input")!;
    }

    setGame(game: Game) {
        this.game = game;
    }

    start() {
        this.letterBodyElement.innerHTML = this.letterHTML;

        const blankElements = document.getElementsByClassName("letter-minigame-blank");
        for (let i = 0; i < blankElements.length; i++) {
            this.blankElements.push(blankElements[i] as HTMLElement);
        }
        // console.log(this.blankElements);

        this.currentBlankIndex = 0;
        this.updateGuesses();
    }

    updateGuesses() {
        this.updateInputArea();

        const letterInputElement = document.getElementsByClassName(
            "letter-minigame-input-element"
        )!;
        this.guessElements = [];
        for (let i = 0; i < letterInputElement.length; i++) {
            this.guessElements.push(letterInputElement[i] as HTMLElement);

            this.guessElements[i].addEventListener("click", () => {
                this.makeGuess(this.guessElements[i].textContent!);
            });
        }
    }

    makeGuess(guess: string) {
        this.blankElements[this.currentBlankIndex].textContent = guess;
        this.blankElements[this.currentBlankIndex].style.color = "black";
        this.blankElements[this.currentBlankIndex].style.backgroundColor = "#ddd";
        this.blankElements[this.currentBlankIndex].style.animation = "";

        console.log(this.blanks[this.currentBlankIndex]);
        console.log(guess);
        if (guess === this.blanks[this.currentBlankIndex]) {
            this.game.applyCardEffect(this.effectGood);
            this.blankElements[this.currentBlankIndex].style.backgroundColor = "#ded";
            this.blankElements[this.currentBlankIndex].style.color = "#050";
        } else {
            this.game.applyCardEffect(this.effectBad);
            this.blankElements[this.currentBlankIndex].style.backgroundColor = "#edd";
            this.blankElements[this.currentBlankIndex].style.color = "#500";
        }

        this.currentBlankIndex++;
        this.updateGuesses();

        if (this.currentBlankIndex < this.blanks.length) {
            this.blankElements[this.currentBlankIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
        }
    }

    isDone() {
        return this.currentBlankIndex >= this.blanks.length;
    }

    async waitTilDone() {
        return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                if (this.isDone()) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    }

    updateInputArea() {
        const inputTag = '<div class="letter-minigame-input-element">';
        const endTag = "</div>";

        let inputHTMLList = [inputTag + this.blanks[this.currentBlankIndex] + endTag];

        const wrongBlankN = 4;
        for (let i = 0; i < wrongBlankN; i++) {
            inputHTMLList.push(
                inputTag +
                    this.wrongBlanks[Math.floor(Math.random() * this.wrongBlanks.length)] +
                    endTag
            );
        }

        inputHTMLList = inputHTMLList.sort(() => Math.random() - 0.5);

        this.letterInputElement.innerHTML = inputHTMLList.join("");

        this.blankElements.forEach((tag, index) => {
            if (index === this.currentBlankIndex) {
                tag.style.animation = "bgBlink 1s infinite";
            } else {
                tag.style.animation = "";
            }
        });
    }

    processLetter() {
        const lines = this.letterRaw.split("\n");
        const paragraphTag = '<div class="letter-minigame-text-paragraph">';
        const blankTag = '<div class="letter-minigame-blank">';
        const endTag = "</div>";
        const blankPattern = "||";

        this.letterHTML = paragraphTag;

        for (const line of lines) {
            if (line === "") {
                this.letterHTML += endTag + paragraphTag;
            } else {
                if (line.includes(blankPattern)) {
                    const blankParts = line.split(blankPattern);
                    this.blanks.push(blankParts[1]);
                    this.letterHTML +=
                        blankTag +
                        blankParts[1] +
                        endTag +
                        (blankParts[2]?.at(0) === " " ? " " : "");
                } else {
                    this.letterHTML += line;
                }
            }
        }

        this.letterHTML += endTag;
    }
}

const letterMinigame1 = new LetterMinigame(
    letter1,
    {
        text: "",
        publicPerceptionModifier: 0.05,
    },
    {
        text: "",
        publicPerceptionModifier: -0.1,
    }
);
const letterMinigame2 = new LetterMinigame(
    letter2,
    {
        text: "",
        shareholdersModifier: 0.05,
    },
    {
        text: "",
        shareholdersModifier: -0.1,
    }
);

const letterMinigame3 = new LetterMinigame(
    letter3,
    {
        text: "",
        employeesModifier: 0.05,
    },
    {
        text: "",
        employeesModifier: -0.1,
    }
);

export const letterMinigames: { [key: string]: LetterMinigame } = {
    consumers: letterMinigame1,
    shareholders: letterMinigame2,
    employees: letterMinigame3,
};
