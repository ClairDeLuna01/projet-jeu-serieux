import { CancelableDelay, formatMoney } from "./utils";
import { clamp, Vector2 } from "@math.gl/core";
import { abs, sign } from "mathjs";
import "./letter_minigame";

import "./card";

import { Card, events, Event, CardEffect } from "./card";

interface SpecialFlagType {
    [key: string]: () => void;
}

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

        const dragEvent = (event: MouseEvent) => {
            this.card_dragging(event);
        };

        this.gameFieldElement.addEventListener("mousedown", (event) => {
            if (this.disableCardDrag) {
                this.cardAnimDelay1.cancel();
                this.cardAnimDelay2.cancel();
                return;
            }
            this.cardClickXpos = event.clientX;
        });

        document.addEventListener("mousemove", dragEvent);

        document.addEventListener("mouseup", (event) => {
            if (this.disableCardDrag) {
                return;
            }
            this.cardClickXpos = -1;
            this.card_stop_dragging();
            this.resetPips();
        });

        // this.cardElement.addEventListener("mouseleave", (event) => {
        //     this.cardElement.removeEventListener("mousemove", dragEvent);
        //     this.cardClickXpos = -1;
        // });
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
        // apply the blur animation to the card with percentage based on the factor
        this.cardImageElement.style.filter = `blur(${abs(factor) * 5}px)`;

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

            if (sign(factor) > 0) {
                // this.cardActionElement.innerText = "OK!!";
                // this.setPips(0, opacityFact, opacityFact);

                this.cardActionElement.innerText =
                    this.currentEvent?.current.card.right.text ?? "No event";

                const pipMask: [number, number, number, number] = [0, 0, 0, 0];
                if (this.currentEvent?.current.card.right.employeesModifier) {
                    pipMask[0] = opacityFact;
                }
                if (this.currentEvent?.current.card.right.shareholdersModifier) {
                    pipMask[1] = opacityFact;
                }
                if (this.currentEvent?.current.card.right.publicPerceptionModifier) {
                    pipMask[2] = opacityFact;
                }
                if (this.currentEvent?.current.card.right.goldenParachuteAmount) {
                    pipMask[3] = opacityFact;
                }

                this.setPips(...pipMask);
            } else {
                this.cardActionElement.innerText =
                    this.currentEvent?.current.card.left.text ?? "No event";

                const pipMask: [number, number, number, number] = [0, 0, 0, 0];
                if (this.currentEvent?.current.card.left.employeesModifier) {
                    pipMask[0] = opacityFact;
                }
                if (this.currentEvent?.current.card.left.shareholdersModifier) {
                    pipMask[1] = opacityFact;
                }
                if (this.currentEvent?.current.card.left.publicPerceptionModifier) {
                    pipMask[2] = opacityFact;
                }
                if (this.currentEvent?.current.card.left.goldenParachuteAmount) {
                    pipMask[3] = opacityFact;
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
    }

    async card_stop_dragging() {
        const valid_threshold = 0.3;
        const card = this.cardElement;
        this.disableCardDrag = true;

        if (abs(this.cardDragFactor) > valid_threshold) {
            const signFactor = sign(this.cardDragFactor);

            card.style.transition = "transform 0.5s";
            card.style.transform = `translateX(${signFactor * window.innerWidth}px)`;

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
                this.cardImageElement.style.filter = "blur(0px)";
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

            this.updateCard();

            await this.cardAnimDelay1.delay(500);

            card.style.transition = "0s";
            card.style.transform = `translateY(${window.innerWidth}px)`;

            await this.cardAnimDelay2.delay(100);
        }

        card.style.transition = "transform 0.5s";
        card.style.transform = "rotate(0rad)";

        this.cardActionElement.style.opacity = "0";
        this.cardActionElement.style.transform = "rotate(0rad)";
        this.cardImageElement.style.filter = "blur(0px)";

        this.cardDragFactor = 0;
        this.disableCardDrag = false;
    }

    card_dragging(event: MouseEvent): void {
        if (this.cardClickXpos === -1 || this.disableCardDrag) {
            return;
        }
        // compute the the factor for the animation based on the mouse x position
        const clickX = event.clientX;

        const dragFactor = 0.001;

        let factor = (clickX - this.cardClickXpos) * dragFactor;

        // factor = clamp(factor, -1, 1);

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

    set_dialogue(value: string): void {
        this.dialogueElement.innerText = value;
    }

    setPips(
        employees: number,
        shareholders: number,
        public_perception: number,
        score: number
    ): void {
        this.employees_element_pip.style.opacity = `${employees}`;
        this.shareholders_element_pip.style.opacity = `${shareholders}`;
        this.public_perception_element_pip.style.opacity = `${public_perception}`;
        this.score_element_pip.style.opacity = `${score}`;
    }

    resetPips(): void {
        this.setPips(0, 0, 0, 0);
    }

    updateCard(): void {
        this.cardImageElement.src = this.currentEvent?.current.card.image ?? "";
        this.dialogueElement.innerText = this.currentEvent?.current.description ?? "";
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

            const randomIndex = Math.floor(Math.random() * matchingEvents.length);
            const event = matchingEvents[randomIndex];

            if (event.requiredFlags.every((flag) => this.flags.includes(flag))) {
                this.currentEvent = event;
                this.currentEvent.current = this.currentEvent.root;
                this.updateCard();
                return;
            }
        }

        const matchingEvents = this.getAllEventsWithMatchingFlags(this.flags);

        const randomIndex = Math.floor(Math.random() * matchingEvents.length);
        const event = matchingEvents[randomIndex];

        if (event.requiredFlags.every((flag) => this.flags.includes(flag))) {
            this.currentEvent = event;
            this.currentEvent.current = this.currentEvent.root;
            this.updateCard();
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

    play() {
        this.update_bars();
        this.currentEvent = events[0];
        this.currentEvent.current = this.currentEvent.root;
        this.updateCard();

        this.resetPips();
    }
}
