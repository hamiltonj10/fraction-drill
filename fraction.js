// =====================================================
// GCD
// =====================================================
function findGcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {
        [a, b] = [b, a % b];
    }

    return a === 0 ? 1 : a;
}

// =====================================================
// Fraction Class
// =====================================================
class Fraction {
    constructor(numerator, denominator) {
        if (denominator === 0) {
            throw new Error("Denominator cannot be 0.");
        }

        if (denominator < 0) {
            numerator *= -1;
            denominator *= -1;
        }

        const divisor = findGcd(
            numerator,
            denominator
        );

        this.numerator =
            numerator / divisor;

        this.denominator =
            denominator / divisor;
    }

    toString() {
        if (this.denominator === 1) {
            return String(this.numerator);
        }

        return `${this.numerator}/${this.denominator}`;
    }

    add(other) {
        return new Fraction(
            this.numerator * other.denominator +
            other.numerator * this.denominator,
            this.denominator * other.denominator
        );
    }

    subtract(other) {
        return new Fraction(
            this.numerator * other.denominator -
            other.numerator * this.denominator,
            this.denominator * other.denominator
        );
    }

    multiply(other) {
        return new Fraction(
            this.numerator * other.numerator,
            this.denominator * other.denominator
        );
    }

    divide(other) {
        if (other.numerator === 0) {
            throw new Error(
                "Cannot divide by 0."
            );
        }

        return new Fraction(
            this.numerator * other.denominator,
            this.denominator * other.numerator
        );
    }

    equals(other) {
        return (
            this.numerator === other.numerator &&
            this.denominator === other.denominator
        );
    }
}

// =====================================================
// Fraction Display Helper
// =====================================================
function fractionHTML(fraction) {
    if (fraction.denominator === 1) {
        return "<span>" + fraction.numerator + "</span>";
    }

    return (
        '<span class="fraction">' +
            '<span class="numerator">' +
                fraction.numerator +
            '</span>' +
            '<span class="denominator">' +
                fraction.denominator +
            '</span>' +
        '</span>'
    );
}

// =====================================================
// Session State
// =====================================================
const session = {
    totalProblems: 10,
    currentProblem: 1,
    correct: 0,
    incorrect: 0,
    streak: 0,
	bestStreak: 0,
    history: [],
	questionResults: [],
    operations: [],
    difficulty: "medium"
};

let currentFraction1 = null;
let currentFraction2 = null;
let currentOperation = null;
let currentAnswer = null;

// =====================================================
// Fraction Helpers
// =====================================================
function randomFraction() {
    return new Fraction(
        Math.floor(Math.random() * 10) + 1,
        Math.floor(Math.random() * 10) + 1
    );
}

function randomOperation() {
    const choices = [
        "+",
        "-",
        "*",
        "/"
    ];

    return choices[
        Math.floor(
            Math.random() *
            choices.length
        )
    ];
}

function doOperation(op, a, b) {
    switch (op) {
        case "+":
            return a.add(b);

        case "-":
            return a.subtract(b);

        case "*":
            return a.multiply(b);

        case "/":
            return a.divide(b);

        default:
            throw new Error(
                "Unknown operation"
            );
    }
}

// Progress Bar
function updateProgressBar() {
    const container =
        document.getElementById(
            "progressBar"
        );

    container.innerHTML = "";

    for (
        let i = 0;
        i < session.totalProblems;
        i++
    ) {
        const segment =
            document.createElement("div");

        segment.classList.add(
            "progress-segment"
        );

        if (
            session.questionResults[i]
            === true
        ) {
            segment.classList.add(
                "correct"
            );

            segment.title =
                `Question ${i + 1}: Correct`;
        }

        if (
            session.questionResults[i]
            === false
        ) {
            segment.classList.add(
                "incorrect"
            );

            segment.title =
                `Question ${i + 1}: Incorrect`;
        }

        if (
            session.questionResults[i]
            === undefined
        ) {
            segment.title =
                `Question ${i + 1}: Not Answered`;
        }

        container.appendChild(
            segment
        );
    }
}

// Preview Update
function updateQuestionCountPreview() {

    const count =
        Number(
            document.getElementById(
                "questionCount"
            ).value
        ) || 0;

    document.getElementById(
        "problemCounter"
    ).textContent =
        `0 / ${count}`;

    const container =
        document.getElementById(
            "progressBar"
        );

    container.innerHTML = "";

    for (
        let i = 0;
        i < count;
        i++
    ) {
        const segment =
            document.createElement("div");

        segment.classList.add(
            "progress-segment"
        );

        container.appendChild(
            segment
        );
    }
}

//Update settings summary
function updateSettingsSummary() {

    const difficulty =
        document.getElementById(
            "difficultySelect"
        ).value;

    const questionCount =
        document.getElementById(
            "questionCount"
        ).value;

    const operations = [];

    if (
        document.getElementById(
            "opAdd"
        ).checked
    ) {
        operations.push(
            "Addition"
        );
    }

    if (
        document.getElementById(
            "opSubtract"
        ).checked
    ) {
        operations.push(
            "Subtraction"
        );
    }

    if (
        document.getElementById(
            "opMultiply"
        ).checked
    ) {
        operations.push(
            "Multiplication"
        );
    }

    if (
        document.getElementById(
            "opDivide"
        ).checked
    ) {
        operations.push(
            "Division"
        );
    }

    let operationText =
        "No Operations";

    if (
        operations.length === 4
    ) {
        operationText =
            "All Operations";
    }
    else if (
        operations.length > 0
    ) {
        operationText =
            operations.join(", ");
    }

    const displayDifficulty =
        difficulty.charAt(0)
            .toUpperCase() +
        difficulty.slice(1);

    document.getElementById(
        "settingsSummaryText"
    ).textContent =
        `${displayDifficulty} • ${questionCount} Questions • ${operationText}`;
    }

// =====================================================
// Dashboard
// =====================================================
function updateDashboard() {
    document.getElementById(
        "problemCounter"
    ).textContent =
        `${session.currentProblem} / ${session.totalProblems}`;

    document.getElementById(
        "scoreValue"
    ).textContent =
        session.correct;

    const answered =
        session.correct +
        session.incorrect;

    const percent =
        answered === 0
            ? 0
            : (
                session.correct /
                answered *
                100
            ).toFixed(1);

    document.getElementById(
        "accuracyValue"
    ).textContent =
        percent + "%";

    document.getElementById(
        "streakValue"
    ).textContent =
        session.streak;

	updateProgressBar();
}

// =====================================================
// History
// =====================================================
function addHistory(message, correct) {
    session.history.push({
        timestamp: new Date(),
        message,
        correct
    });

    const row =
        document.createElement("div");

    row.className =
        correct
            ? "history-row correct"
            : "history-row incorrect";

    row.textContent =
        message;

    document
        .getElementById(
            "sessionHistory"
        )
        .prepend(row);
}

// =====================================================
// Problem Generation
// =====================================================
function generateProblem() {
    currentFraction1 =
        randomFraction();

    currentFraction2 =
        randomFraction();

    currentOperation =
        randomOperation();

    currentAnswer =
        doOperation(
            currentOperation,
            currentFraction1,
            currentFraction2
        );

    const html =
        fractionHTML(currentFraction1) +
        '<span class="operator">' +
        currentOperation +
        '</span>' +
        fractionHTML(currentFraction2);

    document.getElementById(
        "questionText"
    ).innerHTML = html;

	document.getElementById("questionText").innerHTML = html;
}

// =====================================================
// Parse User Input
// =====================================================
function parseFraction(text) {
    text = text.trim();

    if (text.length === 0) {
        throw new Error();
    }

    if (text.includes("/")) {
        const parts =
            text.split("/");

        if (parts.length !== 2) {
            throw new Error();
        }

        const numerator =
            Number(parts[0]);

        const denominator =
            Number(parts[1]);

        if (
            !Number.isInteger(
                numerator
            ) ||
            !Number.isInteger(
                denominator
            ) ||
            denominator === 0
        ) {
            throw new Error();
        }

        return new Fraction(
            numerator,
            denominator
        );
    }

    const value =
        Number(text);

    if (
        !Number.isInteger(value)
    ) {
        throw new Error();
    }

    return new Fraction(
        value,
        1
    );
}

function buildSessionSummary() {
    const totalAnswered =
        session.correct +
        session.incorrect;

    const accuracy =
        totalAnswered === 0
            ? "0.0"
            : (
                session.correct /
                totalAnswered *
                100
            ).toFixed(1);

    return `
        <div class="summary-panel">
            <h2>🎉 Session Complete!</h2>

            <p>
                <strong>Total Questions:</strong>
                ${totalAnswered}
            </p>

            <p>
                <strong>Correct Answers:</strong>
                ${session.correct}
            </p>

            <p>
                <strong>Incorrect Answers:</strong>
                ${session.incorrect}
            </p>

            <p>
                <strong>Accuracy:</strong>
                ${accuracy}%
            </p>

            <p>
                <strong>Best Streak:</strong>
                ${session.bestStreak}
            </p>

            <h3>Great Job!</h3>

            <button
                id="newSessionBtn"
                class="summary-button"
            >
                Start New Session
            </button>
        </div>
    `;
}

// =====================================================
// Submit Answer
// =====================================================
function submitAnswer() {
    try {
        const userInput =
            document.getElementById(
                "answerInput"
            ).value;

        const userFraction =
            parseFraction(
                userInput
            );

        const isCorrect =
            userFraction.equals(
                currentAnswer
            );
		
		session.questionResults.push(
    		isCorrect
		);

        if (isCorrect) {
            session.correct++;

            session.streak++;
			
			if (
				session.streak > session.bestStreak
			) {
				session.bestStreak = session.streak;
			}

            document.getElementById(
                "feedback"
            ).textContent =
                "Correct!";
        } else {
            session.incorrect++;

            session.streak = 0;

            document.getElementById(
                "feedback"
            ).textContent =
                `Incorrect. Answer: ${currentAnswer}`;
        }

        addHistory(
            `${currentFraction1} ${currentOperation} ${currentFraction2} = ${userInput}`,
            isCorrect
        );

        session.currentProblem++;

        document.getElementById(
            "answerInput"
        ).value = "";

        // Session Complete
        if (
            session.currentProblem >
            session.totalProblems
        ) {
            session.currentProblem =
                session.totalProblems;

            updateDashboard();

			document.getElementById(
    			"progressBar"
			).style.width = "100%";

            document.getElementById(
                "questionText"
            ).innerHTML =
                buildSessionSummary();

            document.getElementById(
                "answerInput"
            ).style.display =
                "none";

            document.getElementById(
                "submitBtn"
            ).style.display =
                "none";

            document.getElementById(
                "newSessionBtn"
            ).addEventListener(
                "click",
                resetToStartScreen
            );

            document.getElementById(
                "feedback"
            ).textContent +=
                ` Final Score: ${session.correct}/${session.totalProblems}`;

            document.getElementById(
                "submitBtn"
            ).disabled = true;

            document.getElementById(
                "difficultySelect"
            ).disabled = false;

            document.getElementById(
                "questionCount"
            ).disabled = false;

            return;
        }

        updateDashboard();
        generateProblem();
    }
    catch {
        alert(
            "Please enter a valid fraction."
        );
    }
}

// Start Session
function startSession() {

    session.difficulty =
        document.getElementById(
            "difficultySelect"
        ).value;
    
    const problemCount =
        Number(
            document.getElementById(
                "questionCount"
            ).value
        );

    if (
        !Number.isInteger(problemCount) ||
        problemCount < 1 ||
        problemCount > 50
    ) {
        alert(
            "Please enter between 1 and 50 questions."
        );
        return;
    }

session.totalProblems =
    problemCount;

    document.getElementById(
        "difficultySelect"
    ).disabled = true;

    document.getElementById(
        "settingsContent"
    ).style.display =
        "none";
    
    document.getElementById(
        "questionArea"
    ).style.display =
        "block";

    document.getElementById(
        "startBtn"
    ).style.display =
        "none";

    document.getElementById(
        "questionCount"
    ).disabled = true;

    document.getElementById(
        "answerInput"
    ).disabled = false;

    document.getElementById(
        "submitBtn"
    ).disabled = false;

    document.getElementById(
        "answerInput"
    ).style.display =
        "inline-block";

    document.getElementById(
        "submitBtn"
    ).style.display =
        "inline-block";

    session.currentProblem = 1;
    session.correct = 0;
    session.incorrect = 0;
    session.streak = 0;
    session.bestStreak = 0;
    session.history = [];
    session.questionResults = [];

    document.getElementById(
        "sessionHistory"
    ).innerHTML = "";

    document.getElementById(
        "feedback"
    ).textContent = "";

    updateProgressBar();
    updateDashboard();
    generateProblem();
}

// =====================================================
// Reset Session
// =====================================================
function resetToStartScreen() {

    session.currentProblem = 1;
    session.correct = 0;
    session.incorrect = 0;
    session.streak = 0;
    session.bestStreak = 0;
    session.history = [];
    session.questionResults = [];

    document.getElementById(
        "sessionHistory"
    ).innerHTML = "";

    document.getElementById(
        "feedback"
    ).textContent = "";

    document.getElementById(
        "answerInput"
    ).value = "";

    document.getElementById(
        "questionText"
    ).textContent =
        "Click Start";

    document.getElementById(
        "answerInput"
    ).disabled = true;

    document.getElementById(
        "submitBtn"
    ).disabled = true;

    document.getElementById(
        "difficultySelect"
    ).disabled = false;

    document.getElementById(
        "questionCount"
    ).disabled = false;

    document.getElementById(
        "settingsContent"
    ).style.display =
        "block";

    document.getElementById(
        "startBtn"
    ).style.display =
        "inline-block";

    document.getElementById(
        "questionArea"
    ).style.display =
        "none";

    updateProgressBar();
    updateDashboard();
}

// =====================================================
// Events
// =====================================================
document
    .getElementById("startBtn")
    .addEventListener(
        "click",
        startSession
    );

document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        resetToStartScreen
    );

document
    .getElementById("submitBtn")
    .addEventListener(
        "click",
        submitAnswer
    );

document
    .getElementById(
        "questionCount"
    )
    .addEventListener(
        "input",
        updateQuestionCountPreview
    );


document
.getElementById(
    "difficultySelect"
)
.addEventListener(
    "change",
    updateSettingsSummary
);

// Allow Enter key submission
document
    .getElementById("answerInput")
    .addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                submitAnswer();
            }
        }
    );

document
    .getElementById(
        "questionCount"
    )
    .addEventListener(
        "input",
        () => {

            const input =
                document.getElementById(
                    "questionCount"
                );

            let value =
                Number(input.value);

            if (value < 1) {
                value = 1;
            }

            if (value > 50) {
                value = 50;
            }

            input.value = value;

            updateQuestionCountPreview();
            updateSettingsSummary();
        }
    );

document
    .getElementById(
        "opAdd"
    )
    .addEventListener(
        "change",
        updateSettingsSummary
    );

document
    .getElementById(
        "opSubtract"
    )
    .addEventListener(
        "change",
        updateSettingsSummary
    );

document
    .getElementById(
        "opMultiply"
    )
    .addEventListener(
        "change",
        updateSettingsSummary
    );

document
    .getElementById(
        "opDivide"
    )
    .addEventListener(
        "change",
        updateSettingsSummary
    );

// Initialize dashboard
updateDashboard();
updateQuestionCountPreview();
updateSettingsSummary();

document.getElementById(
    "answerInput"
).disabled = true;

document.getElementById(
    "submitBtn"
).disabled = true;