import eventsJSON from "../events.json";

export interface CardEffect {
    text: string;
    employeesModifier?: number;
    shareholdersModifier?: number;
    publicPerceptionModifier?: number;
    goldenParachuteAmount?: number;
}

export interface Card {
    image: string;

    left: CardEffect;
    right: CardEffect;
}

export interface EventNode {
    card: Card;
    nextRight?: EventNode;
    nextLeft?: EventNode;
    description: string;
}

export class Event {
    public name: string;
    public root: EventNode;
    public current: EventNode;

    constructor(name: string, node: EventNode) {
        this.root = node;
        this.current = node;
        this.name = name;
    }
}

export let events: Event[] = [];

interface JSONEventNode {
    id: number;
    description: string;
    card: Card;
}

interface JSONEventTreeNode {
    id: number;
    right?: JSONEventTreeNode;
    left?: JSONEventTreeNode;
}

interface JSONEventTree {
    name: string;
    tree: JSONEventTreeNode;
}

interface JSONSchema {
    eventNodes: JSONEventNode[];
    eventTrees: JSONEventTree[];
}

function buildTree(tree: JSONEventTreeNode, nodes: JSONEventNode[]): EventNode {
    const node = nodes.find((n) => n.id === tree.id)!;

    const left = tree.left ? buildTree(tree.left, nodes) : undefined;
    const right = tree.right ? buildTree(tree.right, nodes) : undefined;

    return {
        card: node.card,
        description: node.description,
        nextLeft: left,
        nextRight: right,
    };
}

function loadEvents(): void {
    const file: JSONSchema = eventsJSON;

    events = file.eventTrees.map((tree) => {
        const root = buildTree(tree.tree, file.eventNodes);
        return new Event(tree.name, root);
    });
}

loadEvents();
console.log(events);