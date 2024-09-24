export interface Card {
    image: string;
    rightText: string;
    leftText: string;

    // right
    rightemployeesModifier: number;
    rightshareholdersModifier: number;
    rightpublicPerceptionModifier: number;
    rightgoldenParachuteAmount: number;

    // left
    leftemployeesModifier: number;
    leftshareholdersModifier: number;
    leftpublicPerceptionModifier: number;
    leftgoldenParachuteAmount: number;
}

export interface EventNode {
    card: Card;
    nextRight: EventNode | null;
    nextLeft: EventNode | null;
    text: string;
}

export class Event {
    public name = "";
    public root: EventNode;
    public current: EventNode | null;

    constructor(name: string, node: EventNode) {
        this.root = node;
        this.current = node;
        this.name = name;
    }
}

export let events: Event[];
