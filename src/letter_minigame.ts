import letter1 from "../letters/letter1.txt";

class LetterMinigame {
    public letterRaw: string;
    public letterHTML: string;
    public blanks: string[];

    private letterBodyElement: HTMLElement;
    private letterInputElement: HTMLElement;

    constructor(letterRaw: string) {
        this.letterRaw = letterRaw;
        this.blanks = [];

        this.processLetter();

        this.letterBodyElement = document.getElementById("letter-minigame-text")!;
        this.letterInputElement = document.getElementById("letter-minigame-input")!;

        this.letterBodyElement.innerHTML = this.letterHTML;
    }

    processLetter() {
        const lines = this.letterRaw.split("\n");
        const paragraphTag = '<div class="letter-minigame-text-paragraph">';
        const blankTag = '<div class="letter-minigame-blank">';
        const endTag = "</div>";
        const blankPattern = "||";

        const header = `<div id="letter-minigame-text-header">
                        CEO of Nullisoft Inc. <br>
                        1234 Game Street <br>
                        Game City, 12345 <br> <br>
                        Date:
                        <script> document.write(new Date().toLocaleDateString()); </script> <br> <br>
                    </div>`;

        this.letterHTML = header + paragraphTag;

        for (const line of lines) {
            if (line === "") {
                this.letterHTML += endTag + paragraphTag;
            } else {
                const words = line.split(" ");
                for (const word of words) {
                    if (word.includes(blankPattern)) {
                        this.blanks.push(word);
                        this.letterHTML += blankTag + blankPattern + endTag + " ";
                    } else {
                        this.letterHTML += word + " ";
                    }
                }
            }
        }

        this.letterHTML += endTag;
    }
}

const letterMinigame1 = new LetterMinigame(letter1);
