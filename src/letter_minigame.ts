import letter1 from "../letters/letter1.txt";

class LetterMinigame {
    public letterRaw: string;
    public letterHTML: string;
    public blanks: string[];

    constructor(letterRaw: string) {
        this.letterRaw = letterRaw;
        this.blanks = [];

        this.processLetter();
    }

    processLetter() {
        const lines = this.letterRaw.split("\n");
        const paragraphTag = '<div class="letter-minigame-text-paragraph">';
    }
}
