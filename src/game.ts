import { rotate_around_axis } from "./utils";
import { clamp, Vector2 } from "@math.gl/core";
import { abs, sign } from "mathjs";

export class Game {
    private score: number;
    private score_element: HTMLElement;

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
    private cardImageElement: HTMLElement;
    private cardActionElement: HTMLElement;

    private cardClickXpos = -1;
    private cardDragFactor = 0;

    constructor() {
        this.score = 0;
        this.score_element = document.getElementById("score-value")!;

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
        this.cardImageElement = document.getElementById("card-image")!;
        this.cardActionElement = document.getElementById("card-action")!;

        const dragEvent = (event: MouseEvent) => {
            this.card_dragging(event);
        };

        this.cardElement.addEventListener("mousedown", (event) => {
            this.cardClickXpos = event.clientX;
        });

        document.addEventListener("mousemove", dragEvent);

        document.addEventListener("mouseup", (event) => {
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
        const angle = Math.PI / 3;

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

        card.style.transform = `rotate(${angle * factor}rad)`;

        const text_appear_start = 0.0;
        const text_appear_end = 0.5;

        const factorAbs = abs(factor);
        const opacityFact = clamp(
            (factorAbs - text_appear_start) / (text_appear_end - text_appear_start),
            0,
            1
        );
        if (factorAbs > text_appear_start) {
            this.cardActionElement.style.opacity = `${opacityFact}`;

            // TODO fix this when the card system is implemented
            if (sign(factor) > 0) {
                this.cardActionElement.innerText = "OK!!";
                this.setPips(0, opacityFact, opacityFact);
            } else {
                this.cardActionElement.innerText = "NOT OK!!";
                this.setPips(opacityFact, opacityFact, 0);
            }
        } else {
            this.cardActionElement.style.opacity = "0";
        }

        this.cardActionElement.style.transform = `rotate(${-angle * factor}rad)`;

        this.cardDragFactor = factor;
    }

    card_stop_dragging(): void {
        const valid_threshold = 0.3;
        const card = this.cardElement;

        if (abs(this.cardDragFactor) > valid_threshold) {
            const signFactor = sign(this.cardDragFactor);

            card.style.transition = "transform 0.5s";
            card.style.transform = `translateX(${signFactor * window.innerWidth}px)`;

            // TODO fix this when the card system is implemented
            if (signFactor > 0) {
                this.set_public_perception(this.public_perception + 0.1);
                this.set_shareholders(this.shareholders + 0.1);
            } else {
                this.set_employees(this.employees - 0.1);
                this.set_shareholders(this.shareholders - 0.1);
            }

            this.cardDragFactor = 0;
        } else {
            card.style.transition = "transform 0.5s";
            card.style.transform = "rotate(0rad)";

            this.cardActionElement.style.opacity = "0";
            this.cardActionElement.style.transform = "rotate(0rad)";

            this.cardDragFactor = 0;
        }
    }

    card_dragging(event: MouseEvent): void {
        if (this.cardClickXpos === -1) {
            return;
        }
        // compute the the factor for the animation based on the mouse x position
        const clickX = event.clientX;

        const screenWidth = window.innerWidth;
        const screenDragPercentage = 0.5;

        let factor = (clickX - this.cardClickXpos) / (screenWidth * screenDragPercentage);

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
        this.score_element.innerText = this.score.toString();
        this.employees_element.style.height = `${this.employees * 100}%`;
        this.shareholders_element.style.height = `${this.shareholders * 100}%`;
        this.public_perception_element.style.height = `${this.public_perception * 100}%`;
    }

    set_dialogue(value: string): void {
        this.dialogueElement.innerText = value;
    }

    setPips(employees: number, shareholders: number, public_perception: number): void {
        this.employees_element_pip.style.opacity = `${employees}`;
        this.shareholders_element_pip.style.opacity = `${shareholders}`;
        this.public_perception_element_pip.style.opacity = `${public_perception}`;
    }

    resetPips(): void {
        this.setPips(0, 0, 0);
    }

    play() {
        this.update_bars();

        this.resetPips();
    }
}
