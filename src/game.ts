import { CancelableDelay, formatMoney } from "./utils";
import { clamp, Vector2 } from "@math.gl/core";
import { abs, sign } from "mathjs";
import { letterMinigames, LetterMinigame } from "./letter_minigame";
import { typingMinigames, TypingMinigame } from "./typing_minigame";

import "./card";

import { Card, events, Event, CardEffect } from "./card";

interface SpecialFlagType {
    [key: string]: () => void;
}

class Trinket {
    unlocked: boolean;
    flag: string;
    name: string;
    element: HTMLElement;
    constructor(flag: string, imagePath: string, name: string) {
        this.unlocked = false;
        this.flag = flag;
        this.name = name;
        this.element = document.getElementById("trinket-" + name)!;
        this.element.classList.add("hide");
    }
}

const trinkets = [
    new Trinket("HAS_WATER_COOLER", "./assets/trinkets/water_cooler.png", "water-cooler"),
];

export class Game {
    private score: number;
    private score_element: HTMLElement;
    private score_element_pip: HTMLElement;

    private employees: number;
    private employees_element: HTMLElement;
    private employees_element_pip: HTMLElement;

    private shareholders: number;
    private shareholders_element: HTMLElement;
    private shareholders_element_pip: HTMLElement;

    private public_perception: number;
    private public_perception_element: HTMLElement;
    private public_perception_element_pip: HTMLElement;

    private dialogueElement: HTMLElement;

    private cardElement: HTMLElement;
    private cardImageElement: HTMLImageElement;
    private cardActionElement: HTMLElement;

    private gameFieldElement: HTMLElement;
    private gameElement: HTMLElement;
    private letterMinigameElement: HTMLElement;
    private typingMinigameElement: HTMLElement;

    private isUpdatingName = false;
    private nameElement: HTMLElement;

    private cardClickXpos = -1;
    private cardDragFactor = 0;

    private currentEvent?: Event = undefined;

    private disableCardDrag = false;

    private cardAnimDelay1 = new CancelableDelay();
    private cardAnimDelay2 = new CancelableDelay();

    private flags: string[] = [];

    private lowThreshold = 0.3;
    private veryLowThreshold = 0.1;
    private highThreshold = 0.7;
    private veryHighThreshold = 0.9;

    private gameVolume = localStorage.getItem("volume")
        ? parseFloat(localStorage.getItem("volume")!)
        : 0.5;

    private musics: HTMLAudioElement[] = [];
    private currentMusic: number = 0;

    private sfx: { [key: string]: HTMLAudioElement } = {};

    private wooshPrimed = false;

    private barFlags: string[] = [
        "LOW_EMPLOYEES",
        "LOW_SHAREHOLDERS",
        "LOW_PUBLIC_PERCEPTION",
        "VERY_LOW_EMPLOYEES",
        "VERY_LOW_SHAREHOLDERS",
        "VERY_LOW_PUBLIC_PERCEPTION",
        "ZERO_EMPLOYEES",
        "ZERO_SHAREHOLDERS",
        "ZERO_PUBLIC_PERCEPTION",
        "HIGH_EMPLOYEES",
        "HIGH_SHAREHOLDERS",
        "HIGH_PUBLIC_PERCEPTION",
        "VERY_HIGH_EMPLOYEES",
        "VERY_HIGH_SHAREHOLDERS",
        "VERY_HIGH_PUBLIC_PERCEPTION",
        "MAX_EMPLOYEES",
        "MAX_SHAREHOLDERS",
        "MAX_PUBLIC_PERCEPTION",
    ];

    private specialFlags: SpecialFlagType = {
        MANAGER_FIRED: function () {
            console.log("flag1");
        },
    };

    constructor() {
        this.score = 0;
        this.score_element = document.getElementById("score-value")!;
        this.score_element_pip = document.getElementById("score-pip")!;

        this.employees = 0.5;
        this.employees_element = document.getElementById("employees-fill")!;
        this.employees_element_pip = document.getElementById("employees-pip")!;

        this.shareholders = 0.5;
        this.shareholders_element = document.getElementById("shareholders-fill")!;
        this.shareholders_element_pip = document.getElementById("shareholders-pip")!;

        this.public_perception = 0.5;
        this.public_perception_element = document.getElementById("public-perception-fill")!;
        this.public_perception_element_pip = document.getElementById("public-perception-pip")!;

        this.dialogueElement = document.getElementById("dialogue")!;

        this.cardElement = document.getElementById("card")!;
        this.cardImageElement = document.getElementById("card-image") as HTMLImageElement;
        this.cardActionElement = document.getElementById("card-action")!;

        this.gameFieldElement = document.getElementById("game-field")!;
        this.gameElement = document.getElementById("game")!;

        this.nameElement = document.getElementById("name")!;

        this.letterMinigameElement = document.getElementById("letter-minigame")!;
        this.letterMinigameElement.classList.add("hide");

        this.typingMinigameElement = document.getElementById("typing-minigame")!;
        this.typingMinigameElement.classList.add("hide");

        const dragEvent = (event: MouseEvent) => {
            // console.log("dragging");
            this.card_dragging(event);
        };

        this.gameFieldElement.addEventListener("pointerdown", (event) => {
            if (this.disableCardDrag) {
                this.cardAnimDelay1.cancel();
                this.cardAnimDelay2.cancel();
                return;
            }
            this.cardClickXpos = event.clientX;
        });

        document.addEventListener("pointermove", dragEvent);

        document.addEventListener("pointerup", (event) => {
            if (this.disableCardDrag) {
                return;
            }
            this.cardClickXpos = -1;
            this.card_stop_dragging();
            this.resetPips();
        });

        window.onload = () => {
            if (window.innerWidth < 600) {
                alert(
                    "Nous avons détecté que vous utilisez un appareil mobile. Pour une meilleure expérience, veuillez activer le mode plein écran dans le menu des options."
                );
            }
        };

        this.loadMusics();
        this.loadSFX();
    }

    async loadMusics() {
        const path = "assets/music/";

        // the different music files, shuffled
        const files = [
            "soundcloud_1249036261_audio.mp3",
            "soundcloud_638492481_audio.mp3",
            "soundcloud_1746732276_audio.mp3",
            "soundcloud_771890329_audio.mp3",
        ].sort(() => Math.random() - 0.5);

        for (const file of files) {
            const audio = new Audio(path + file);
            audio.loop = false;
            audio.volume = this.gameVolume;
            audio.onended = () => this.playNextMusic();
            this.musics.push(audio);
        }

        // this.musics[0].play();
    }

    async loadSFX() {
        this.sfx = {
            whoosh1: new Audio("assets/sfx/whoosh1.mp3"),
            whoosh2: new Audio("assets/sfx/whoosh2.mp3"),
            type: new Audio("assets/sfx/type.mp3"),
            carriage_return: new Audio("assets/sfx/carriage_return.mp3"),
        };
    }

    playNextMusic() {
        this.musics[this.currentMusic].pause();
        this.musics[this.currentMusic].currentTime = 0;
        this.currentMusic = (this.currentMusic + 1) % this.musics.length;
        this.musics[this.currentMusic].play();
        console.log("Playing music", this.currentMusic);
    }

    card_animation(factor: number): void {
        const card = this.cardElement;
        const angle = Math.PI / 12;
        const translation = 50;

        card.style.transition = "transform 0s";

        // maybe apply smoothing to the animation eventually
        // const threshold = 0.95;
        // const strength = 10;
        // if (abs(factor) > threshold) {
        //     const excess = abs(factor) - threshold;
        //     const friction = Math.pow(excess, strength);
        //     const factorSign = sign(factor);

        //     factor = factorSign * (threshold + friction);

        //     factor = clamp(factor, -1, 1);
        // }

        factor = clamp(factor, -1, 1);

        card.style.transform = `rotate(${angle * factor}rad) translateX(${translation * factor}%)`;
        // apply the fade to white animation to the card with percentage based on the factor
        const fadeFactor = 0.8;
        this.cardImageElement.style.filter = `contrast(${
            1 - abs(factor * fadeFactor)
        }) brightness(${1 - abs(factor * fadeFactor)})`;

        const text_appear_start = 0.0;
        const text_appear_end = 0.3;

        const factorAbs = abs(factor);
        const opacityFact = clamp(
            (factorAbs - text_appear_start) / (text_appear_end - text_appear_start),
            0,
            1
        );
        if (factorAbs > text_appear_start) {
            this.cardActionElement.style.opacity = `${opacityFact}`;

            const largePipThreshold = 0.3;
            const largePipThresholdScorePercentage = 0.1; // if the score increase is more than this percentage of the total score

            if (sign(factor) > 0) {
                // this.cardActionElement.innerText = "OK!!";
                // this.setPips(0, opacityFact, opacityFact);

                this.cardActionElement.innerText =
                    this.currentEvent?.current.card.right.text ?? "No event";

                const pipMask: [number, number, number, number] = [0, 0, 0, 0];
                if (this.currentEvent?.current.card.right.employeesModifier) {
                    pipMask[0] =
                        opacityFact +
                        (this.currentEvent?.current.card.right.employeesModifier >=
                        largePipThreshold
                            ? 1.0
                            : 0);
                }
                if (this.currentEvent?.current.card.right.shareholdersModifier) {
                    pipMask[1] =
                        opacityFact +
                        (this.currentEvent?.current.card.right.shareholdersModifier >=
                        largePipThreshold
                            ? 1.0
                            : 0);
                }
                if (this.currentEvent?.current.card.right.publicPerceptionModifier) {
                    pipMask[2] =
                        opacityFact +
                        (this.currentEvent?.current.card.right.publicPerceptionModifier >=
                        largePipThreshold
                            ? 1.0
                            : 0);
                }
                if (this.currentEvent?.current.card.right.goldenParachuteAmount) {
                    pipMask[3] =
                        opacityFact +
                        (this.currentEvent?.current.card.right.goldenParachuteAmount >=
                        this.score * largePipThresholdScorePercentage
                            ? 1.0
                            : 0);
                }

                this.setPips(...pipMask);
            } else {
                this.cardActionElement.innerText =
                    this.currentEvent?.current.card.left.text ?? "No event";

                const pipMask: [number, number, number, number] = [0, 0, 0, 0];
                if (this.currentEvent?.current.card.left.employeesModifier) {
                    pipMask[0] =
                        opacityFact +
                        (this.currentEvent?.current.card.left.employeesModifier >= largePipThreshold
                            ? 1.0
                            : 0);
                }
                if (this.currentEvent?.current.card.left.shareholdersModifier) {
                    pipMask[1] =
                        opacityFact +
                        (this.currentEvent?.current.card.left.shareholdersModifier >=
                        largePipThreshold
                            ? 1.0
                            : 0);
                }
                if (this.currentEvent?.current.card.left.publicPerceptionModifier) {
                    pipMask[2] =
                        opacityFact +
                        (this.currentEvent?.current.card.left.publicPerceptionModifier >=
                        largePipThreshold
                            ? 1.0
                            : 0);
                }
                if (this.currentEvent?.current.card.left.goldenParachuteAmount) {
                    pipMask[3] =
                        opacityFact +
                        (this.currentEvent?.current.card.left.goldenParachuteAmount >=
                        this.score * largePipThresholdScorePercentage
                            ? 1.0
                            : 0);
                }

                this.setPips(...pipMask);
            }
        } else {
            this.cardActionElement.style.opacity = "0";
        }

        this.cardActionElement.style.transform = `rotate(${-angle * factor}rad)`;

        this.cardDragFactor = factor;
    }

    applyCardEffect(effect: CardEffect): void {
        if (effect.employeesModifier) {
            this.set_employees(this.employees + effect.employeesModifier);
        }
        if (effect.shareholdersModifier) {
            this.set_shareholders(this.shareholders + effect.shareholdersModifier);
        }
        if (effect.publicPerceptionModifier) {
            this.set_public_perception(this.public_perception + effect.publicPerceptionModifier);
        }
        if (effect.goldenParachuteAmount) {
            this.add_score(effect.goldenParachuteAmount);
        }
        if (effect.flags) {
            this.flags.push(...effect.flags);

            effect.flags.forEach((flag) => {
                if (this.specialFlags[flag]) {
                    this.specialFlags[flag]();
                }
            });
        }
        if (effect.removeFlags) {
            this.flags = this.flags.filter((flag) => !effect.removeFlags?.includes(flag));
        }

        this.updateTrinkets();
    }

    async card_stop_dragging() {
        const valid_threshold = 0.3;
        const card = this.cardElement;
        this.disableCardDrag = true;

        if (abs(this.cardDragFactor) > valid_threshold) {
            const signFactor = sign(this.cardDragFactor);

            card.style.transition = "transform 0.5s";
            card.style.transform = `translateX(${signFactor * window.innerWidth}px)`;

            this.sfx.whoosh2.currentTime = 0;
            this.sfx.whoosh2.volume = this.gameVolume;
            this.sfx.whoosh2.play();

            if (signFactor > 0) {
                this.applyCardEffect(
                    this.currentEvent?.current.card.right ?? {
                        text: "No event",
                    }
                );

                if (this.currentEvent?.current.nextRight) {
                    this.currentEvent.current = this.currentEvent.current.nextRight;
                } else {
                    this.pick_random_event();
                }
            } else {
                this.cardImageElement.style.filter = "";
                this.applyCardEffect(
                    this.currentEvent?.current.card.left ?? {
                        text: "No event",
                    }
                );

                if (this.currentEvent?.current.nextLeft) {
                    this.currentEvent.current = this.currentEvent.current.nextLeft;
                } else {
                    this.pick_random_event();
                }
            }

            this.dialogueElement.style.animation = "fadeOut 0.5s forwards";

            await this.cardAnimDelay1.delay(500);

            card.style.transition = "0s";
            card.style.transform = `translateY(${window.innerWidth}px)`;

            await this.cardAnimDelay2.delay(100);
        }

        card.style.transition = "transform 0.5s";
        card.style.transform = "rotate(0rad)";

        this.updateCard();

        this.cardActionElement.style.opacity = "0";
        this.cardActionElement.style.transform = "rotate(0rad)";
        this.cardImageElement.style.filter = "";

        this.cardDragFactor = 0;
        this.disableCardDrag = false;
    }

    card_dragging(event: MouseEvent): void {
        if (this.cardClickXpos === -1 || this.disableCardDrag) {
            return;
        }
        // compute the the factor for the animation based on the mouse x position
        const clickX = event.clientX;

        const dragFactor = 1 / Math.min(window.innerWidth, 700);

        let factor = (clickX - this.cardClickXpos) * dragFactor;

        // factor = clamp(factor, -1, 1);

        // we only want to play the sfx if the card has been "reset" to the center
        if (abs(factor) < 0.1) {
            this.wooshPrimed = true;
        }

        if (this.wooshPrimed && abs(factor) > 0.1) {
            this.sfx.whoosh1.currentTime = 0;
            this.sfx.whoosh1.volume = this.gameVolume;
            this.sfx.whoosh1.play();
            this.wooshPrimed = false;
        }

        this.card_animation(factor);
    }

    add_score(value: number): void {
        this.score += value;
        this.update_bars();
    }

    set_employees(value: number): void {
        if (value > this.employees) {
            this.employees_element.style.animation = "none";
            this.employees_element.offsetHeight; // trigger reflow ?????
            this.employees_element.style.animation = "fill-positive 0.5s";
        } else if (value < this.employees) {
            this.employees_element.style.animation = "none";
            this.employees_element.offsetHeight;
            this.employees_element.style.animation = "fill-negative 0.5s";
        }
        this.employees = clamp(value, 0, 1);
        this.update_bars();
    }

    set_shareholders(value: number): void {
        if (value > this.shareholders) {
            this.shareholders_element.style.animation = "none";
            this.shareholders_element.offsetHeight; // trigger reflow ?????
            this.shareholders_element.style.animation = "fill-positive 0.5s";
        } else if (value < this.shareholders) {
            this.shareholders_element.style.animation = "none";
            this.shareholders_element.offsetHeight;
            this.shareholders_element.style.animation = "fill-negative 0.5s";
        }
        this.shareholders = clamp(value, 0, 1);
        this.update_bars();
    }

    set_public_perception(value: number): void {
        if (value > this.public_perception) {
            this.public_perception_element.style.animation = "none";
            this.public_perception_element.offsetHeight; // trigger reflow ?????
            this.public_perception_element.style.animation = "fill-positive 0.5s";
        } else if (value < this.public_perception) {
            this.public_perception_element.style.animation = "none";
            this.public_perception_element.offsetHeight;
            this.public_perception_element.style.animation = "fill-negative 0.5s";
        }

        this.public_perception = clamp(value, 0, 1);
        this.update_bars();
    }

    update_bars(): void {
        this.employees_element.style.height = `${this.employees * 100}%`;
        this.shareholders_element.style.height = `${this.shareholders * 100}%`;
        this.public_perception_element.style.height = `${this.public_perception * 100}%`;

        this.score_element.innerText = formatMoney(this.score);
    }

    async set_dialogue(value: string): Promise<void> {
        this.dialogueElement.innerText = value;
        // this.dialogueElement.style.animation = "none";
        // this.dialogueElement.style.transform = "translateY(-300px)";
        // this.dialogueElement.style.transition = "0s";
        // this.dialogueElement.offsetHeight;
        // await new Promise((resolve) => setTimeout(resolve, 100));
        this.dialogueElement.style.animation = "fadeIn 1.0s";
        // this.dialogueElement.style.transition = "transform 0.3s";
        // this.dialogueElement.style.transform = "translateY(0)";
    }

    setPips(
        employees: number,
        shareholders: number,
        public_perception: number,
        score: number
    ): void {
        if (employees > 1) {
            this.employees_element_pip.style.opacity = `${employees - 1}`;
            this.employees_element_pip.classList.remove("pip");
            this.employees_element_pip.classList.add("pip-big");
        } else {
            this.employees_element_pip.style.opacity = `${employees}`;
            this.employees_element_pip.classList.remove("pip-big");
            this.employees_element_pip.classList.add("pip");
        }

        if (shareholders > 1) {
            this.shareholders_element_pip.style.opacity = `${shareholders - 1}`;
            this.shareholders_element_pip.classList.remove("pip");
            this.shareholders_element_pip.classList.add("pip-big");
        } else {
            this.shareholders_element_pip.style.opacity = `${shareholders}`;
            this.shareholders_element_pip.classList.remove("pip-big");
            this.shareholders_element_pip.classList.add("pip");
        }

        if (public_perception > 1) {
            this.public_perception_element_pip.style.opacity = `${public_perception - 1}`;
            this.public_perception_element_pip.classList.remove("pip");
            this.public_perception_element_pip.classList.add("pip-big");
        } else {
            this.public_perception_element_pip.style.opacity = `${public_perception}`;
            this.public_perception_element_pip.classList.remove("pip-big");
            this.public_perception_element_pip.classList.add("pip");
        }

        if (score > 1) {
            this.score_element_pip.style.opacity = `${score - 1}`;
            this.score_element_pip.classList.remove("pip");
            this.score_element_pip.classList.add("pip-big");
        } else {
            this.score_element_pip.style.opacity = `${score}`;
            this.score_element_pip.classList.remove("pip-big");
            this.score_element_pip.classList.add("pip");
        }
    }

    resetPips(): void {
        this.setPips(0, 0, 0, 0);
    }

    extractNameFromEventImagePath(): string {
        const path = this.currentEvent?.current.card.image ?? "";
        const parts = path.split("/");
        const folder = parts[parts.length - 2];

        const names: any = {
            nerd: "Le Nerd",
            hr: "Ressources Humaines",
            influencer: "L'Influenceur",
            lobbyist: "Le Lobbyiste",
            manager: "Le Manager",
            shareholder: "Les Actionnaires",
        };

        return names[folder] ?? "";
    }

    async updateName() {
        if (this.isUpdatingName) {
            return;
        }
        this.isUpdatingName = true;
        const name = this.extractNameFromEventImagePath();
        if (this.nameElement.innerText !== name && name !== "") {
            for (let i = 0; i < name.length; i++) {
                this.sfx.type.currentTime = 0;
                this.sfx.type.volume = this.gameVolume;
                this.sfx.type.play();
                this.nameElement.innerText = name.slice(0, i + 1);
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            this.nameElement.innerText = name;
            this.sfx.carriage_return.currentTime = 0;
            this.sfx.carriage_return.volume = this.gameVolume;
            this.sfx.carriage_return.play();
        } else if (name === "") {
            this.nameElement.innerText = "";
        } else {
            this.nameElement.innerText = name;
        }

        this.isUpdatingName = false;
    }

    updateCard(): void {
        this.cardImageElement.src = this.currentEvent?.current.card.image ?? "";
        this.set_dialogue(this.currentEvent?.current.description ?? "");
        this.updateName();

        if (
            this.extractNameFromEventImagePath() == "Le Manager" &&
            this.flags.find((flag) => flag == "MANAGER_FIRED")
        ) {
            this.cardImageElement.src = this.cardImageElement.src.replace(".jpg", "_mustache.jpg");
        }
    }

    updateTrinkets(): void {
        for (const trinket of trinkets) {
            if (this.flags.includes(trinket.flag)) {
                trinket.element.classList.remove("hide");
            } else {
                trinket.element.classList.add("hide");
            }
        }
    }

    getAllEventsWithMatchingFlags(flags: string[]): Event[] {
        return events.filter((event) => {
            return (
                event.requiredFlags.every((flag) => flags.includes(flag)) &&
                !event.notFlags.some((flag) => flags.includes(flag))
            );
        });
    }

    isAnyBarMaxOrZero(): boolean {
        return (
            this.employees === 0 ||
            this.employees === 1 ||
            this.shareholders === 0 ||
            this.shareholders === 1 ||
            this.public_perception === 0 ||
            this.public_perception === 1
        );
    }

    getAllEventsWithAppropriateMaxOrZeroFlag(): Event[] {
        return events.filter((event) => {
            return (
                (this.employees === 0 && event.requiredFlags.includes("ZERO_EMPLOYEES")) ||
                (this.employees === 1 && event.requiredFlags.includes("MAX_EMPLOYEES")) ||
                (this.shareholders === 0 && event.requiredFlags.includes("ZERO_SHAREHOLDERS")) ||
                (this.shareholders === 1 && event.requiredFlags.includes("MAX_SHAREHOLDERS")) ||
                (this.public_perception === 0 &&
                    event.requiredFlags.includes("ZERO_PUBLIC_PERCEPTION")) ||
                (this.public_perception === 1 &&
                    event.requiredFlags.includes("MAX_PUBLIC_PERCEPTION"))
            );
        });
    }

    pick_random_event(): void {
        if (this.isAnyBarMaxOrZero()) {
            const matchingEvents = this.getAllEventsWithAppropriateMaxOrZeroFlag();
            if (matchingEvents.length > 0) {
                const randomIndex = Math.floor(Math.random() * matchingEvents.length);
                const event = matchingEvents[randomIndex];

                if (event.requiredFlags.every((flag) => this.flags.includes(flag))) {
                    this.currentEvent = event;
                    this.currentEvent.current = this.currentEvent.root;
                    // this.updateCard();
                    return;
                }
            }
        }

        const matchingEvents = this.getAllEventsWithMatchingFlags(this.flags);

        const randomIndex = Math.floor(Math.random() * matchingEvents.length);
        const event = matchingEvents[randomIndex];

        if (event.requiredFlags.every((flag) => this.flags.includes(flag))) {
            this.currentEvent = event;
            this.currentEvent.current = this.currentEvent.root;
            // this.updateCard();
            return;
        }

        // console.log(this.currentEvent, randomIndex);
    }

    updateBarFlags(): void {
        // start by removing all bar flags
        this.barFlags.forEach((flag) => {
            this.flags = this.flags.filter((f) => f !== flag);
        });

        // add the new flags
        // employees
        if (this.employees < this.lowThreshold) {
            this.flags.push("LOW_EMPLOYEES");
        } else if (this.employees < this.veryLowThreshold) {
            this.flags.push("VERY_LOW_EMPLOYEES");
        } else if (this.employees === 0) {
            this.flags.push("ZERO_EMPLOYEES");
        } else if (this.employees > this.highThreshold) {
            this.flags.push("HIGH_EMPLOYEES");
        } else if (this.employees > this.veryHighThreshold) {
            this.flags.push("VERY_HIGH_EMPLOYEES");
        } else if (this.employees === 1) {
            this.flags.push("MAX_EMPLOYEES");
        }

        // shareholders
        if (this.shareholders < this.lowThreshold) {
            this.flags.push("LOW_SHAREHOLDERS");
        } else if (this.shareholders < this.veryLowThreshold) {
            this.flags.push("VERY_LOW_SHAREHOLDERS");
        } else if (this.shareholders === 0) {
            this.flags.push("ZERO_SHAREHOLDERS");
        } else if (this.shareholders > this.highThreshold) {
            this.flags.push("HIGH_SHAREHOLDERS");
        } else if (this.shareholders > this.veryHighThreshold) {
            this.flags.push("VERY_HIGH_SHAREHOLDERS");
        } else if (this.shareholders === 1) {
            this.flags.push("MAX_SHAREHOLDERS");
        }

        // public perception
        if (this.public_perception < this.lowThreshold) {
            this.flags.push("LOW_PUBLIC_PERCEPTION");
        } else if (this.public_perception < this.veryLowThreshold) {
            this.flags.push("VERY_LOW_PUBLIC_PERCEPTION");
        } else if (this.public_perception === 0) {
            this.flags.push("ZERO_PUBLIC_PERCEPTION");
        } else if (this.public_perception > this.highThreshold) {
            this.flags.push("HIGH_PUBLIC_PERCEPTION");
        } else if (this.public_perception > this.veryHighThreshold) {
            this.flags.push("VERY_HIGH_PUBLIC_PERCEPTION");
        } else if (this.public_perception === 1) {
            this.flags.push("MAX_PUBLIC_PERCEPTION");
        }
    }

    async startLetterMinigame(minigame: LetterMinigame) {
        this.gameFieldElement.classList.add("hide");
        this.letterMinigameElement.classList.remove("hide");
        minigame.setGame(this);

        minigame.start();

        await minigame.waitTilDone();

        this.gameFieldElement.classList.remove("hide");
        this.letterMinigameElement.classList.add("hide");
        this.pick_random_event();
    }

    async startTypingMinigame(minigame: TypingMinigame) {
        this.gameFieldElement.classList.add("hide");
        this.typingMinigameElement.classList.remove("hide");
        minigame.setGame(this);

        minigame.start();

        await minigame.waitTilDone();

        this.gameFieldElement.classList.remove("hide");
        this.typingMinigameElement.classList.add("hide");
        this.pick_random_event();
    }

    getVolume(): number {
        return this.gameVolume;
    }

    setVolume(volume: number): void {
        this.gameVolume = volume;
        localStorage.setItem("volume", volume.toString());

        this.musics.forEach((music) => {
            music.volume = volume;
        });
    }

    play() {
        this.gameElement.classList.remove("hide");
        this.gameFieldElement.classList.remove("hide");
        this.update_bars();
        this.currentEvent = events[0];
        this.currentEvent.current = this.currentEvent.root;
        this.updateCard();

        this.resetPips();

        this.musics[0].play();

        // this.startLetterMinigame(letterMinigames[1]);
        // this.startTypingMinigame(typingMinigames[0]);
    }
}
