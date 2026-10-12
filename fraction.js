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
    difficulty: "medium",
    maxFractionValue: 20,
    maxTerms: 2,
    skillRating: 50
};

let currentFractions = [];
let currentOperations = [];
let currentAnswer = null;

// =====================================================
// Fraction Helpers
// =====================================================
function randomFraction() {

    return new Fraction(

        Math.floor(
            Math.random() *
            session.maxFractionValue
        ) + 1,

        Math.floor(
            Math.random() *
            session.maxFractionValue
        ) + 1

    );
}

function randomOperation() {

    if (
        session.operations.length === 0
    ) {
        return "+";
    }

    return session.operations[
        Math.floor(
            Math.random() *
            session.operations.length
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

function evaluateExpression(
    fractions,
    operations
) {

    let result =
        fractions[0];

    for (
        let i = 0;
        i < operations.length;
        i++
    ) {

        result =
            doOperation(
                operations[i],
                result,
                fractions[i + 1]
            );
    }

    return result;
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

    let summaryText = "";

    switch (difficulty) {

        case "easy":

            summaryText =
                `Easy • ${questionCount} Questions • 2 Terms • Addition, Subtraction`;

            break;

        case "medium":

            summaryText =
                `Medium • ${questionCount} Questions • Up To 3 Terms • Addition, Subtraction, Multiplication`;

            break;

        case "hard":

            summaryText =
                `Hard • ${questionCount} Questions • Up To 5 Terms • All Operations`;

            break;

        case "adaptive":

            summaryText =
                `Adaptive • ${questionCount} Questions • Dynamic Difficulty`;

            break;

        case "custom":

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

            const maxTerms =
                document.getElementById(
                    "maxTerms"
                ).value;

            summaryText =
                `Custom • ${questionCount} Questions • Up To ${maxTerms} Terms • ${operations.join(", ")}`;

            break;
    }

    document.getElementById(
        "settingsSummaryText"
    ).textContent =
        summaryText;
}

function updateAdaptiveStatus() {

    const status =
        document.getElementById(
            "adaptiveStatus"
        );

    if (
        session.difficulty !==
        "adaptive"
    ) {
        status.textContent = "";
        return;
    }

    let level = "Medium";

    if (
        session.skillRating <= 25
    ) {
        level = "Easy";
    }
    else if (
        session.skillRating <= 50
    ) {
        level = "Medium";
    }
    else if (
        session.skillRating <= 75
    ) {
        level = "Hard";
    }
    else {
        level = "Expert";
    }

    status.textContent =
        `Adaptive Rating: ${session.skillRating} (${level})`;
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

    currentFractions = [];
    currentOperations = [];

    let termCount = 2;

    switch (
        session.difficulty
    ) {

        case "easy":
            termCount = 2;
            break;

        case "medium":
            termCount =
                Math.floor(
                    Math.random() * 2
                ) + 2;
            break;

        case "hard":
            termCount =
                Math.floor(
                    Math.random() * 3
                ) + 3;
            break;

        case "adaptive":
            termCount = 2;
            break;

        case "custom":
            termCount =
                Math.floor(
                    Math.random() *
                    (
                        session.maxTerms - 1
                    )
                ) + 2;
            break;
    }

    for (
        let i = 0;
        i < termCount;
        i++
    ) {

        currentFractions.push(
            randomFraction()
        );

        if (
            i < termCount - 1
        ) {
            currentOperations.push(
                randomOperation()
            );
        }
    }

    currentAnswer =
        evaluateExpression(
            currentFractions,
            currentOperations
        );

    let html =
        fractionHTML(
            currentFractions[0]
        );

    for (
        let i = 0;
        i < currentOperations.length;
        i++
    ) {

        html +=
            '<span class="operator">' +
            currentOperations[i] +
            '</span>' +
            fractionHTML(
                currentFractions[
                    i + 1
                ]
            );
    }

    document.getElementById(
        "questionText"
    ).innerHTML = html;
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

            // Adaptive Rating Increase
            if (
                session.difficulty ===
                "adaptive"
            ) {
                session.skillRating =
                    Math.min(
                        100,
                        session.skillRating + 3
                    );

                updateAdaptiveDifficulty();
                updateAdaptiveStatus();
            }

            document.getElementById(
                "feedback"
            ).textContent =
                "Correct!";
        } else {
            session.incorrect++;

            session.streak = 0;

            // Adaptive Rating Decrease
            if (
                session.difficulty ===
                "adaptive"
            ) {
                session.skillRating =
                    Math.max(
                        0,
                        session.skillRating - 5
                    );

                updateAdaptiveDifficulty();
                updateAdaptiveStatus();
            }

            document.getElementById(
                "feedback"
            ).textContent =
                `Incorrect. Answer: ${currentAnswer}`;
        }

       let expression =
            currentFractions[0]
                .toString();

        for (
            let i = 0;
            i < currentOperations.length;
            i++
        ) {

            expression +=
                ` ${currentOperations[i]} ` +
                currentFractions[
                    i + 1
                ].toString();
        }

        addHistory(
            `${expression} = ${userInput}`,
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
                "resetBtn"
            ).style.display =
                "none";

            document.getElementById(
                "feedback"
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

    if (
        session.difficulty ===
        "custom"
    ) {

        const hasOperation =
            document.getElementById(
                "opAdd"
            ).checked ||

            document.getElementById(
                "opSubtract"
            ).checked ||

            document.getElementById(
                "opMultiply"
            ).checked ||

            document.getElementById(
                "opDivide"
            ).checked;

        if (!hasOperation) {

            alert(
                "Please select at least one operation."
            );

            return;
        }
    }

    applyDifficultySettings();
    
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
        "answerInput"
    ).style.display =
        "inline-block";

    document.getElementById(
        "submitBtn"
    ).style.display =
        "inline-block";

    document.getElementById(
        "resetBtn"
    ).style.display =
        "inline-block";

    document.getElementById(
        "feedback"
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
    session.skillRating = 50;
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
    updateAdaptiveStatus();
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

    document.getElementById(
        "answerInput"
    ).style.display =
        "inline-block";

    document.getElementById(
        "submitBtn"
    ).style.display =
        "inline-block";

    document.getElementById(
        "resetBtn"
    ).style.display =
        "inline-block";

    document.getElementById(
        "feedback"
    ).style.display =
        "block";

    updateProgressBar();
    updateDashboard();
}

// Difficulty Settings
function applyDifficultySettings() {

    switch (
        session.difficulty
    ) {

        case "easy":

            session.maxFractionValue = 5;
            session.maxTerms = 2;

            session.operations =
                ["+", "-"];

            break;

        case "medium":

            session.maxFractionValue = 10;
            session.maxTerms = 3;

            session.operations =
                ["+", "-", "*"];

            break;

        case "hard":

            session.maxFractionValue = 20;
            session.maxTerms = 5;

            session.operations =
                ["+", "-", "*", "/"];

            break;

        case "adaptive":

            session.maxFractionValue =
                10;

            session.maxTerms =
                2;

            break;
        
        case "custom":

            session.maxFractionValue =
                20;

            session.maxTerms =
                Number(
                    document.getElementById(
                        "maxTerms"
                    ).value
                );

            session.operations = [];

            if (
                document.getElementById(
                    "opAdd"
                ).checked
            ) {
                session.operations.push("+");
            }

            if (
                document.getElementById(
                    "opSubtract"
                ).checked
            ) {
                session.operations.push("-");
            }

            if (
                document.getElementById(
                    "opMultiply"
                ).checked
            ) {
                session.operations.push("*");
            }

            if (
                document.getElementById(
                    "opDivide"
                ).checked
            ) {
                session.operations.push("/");
            }

            break;
        }
}

// Difficulty Visibility
function updateDifficultyVisibility() {

    const difficulty =
        document.getElementById(
            "difficultySelect"
        ).value;

    const isCustom =
        difficulty === "custom";

    document.getElementById(
        "customSettings"
    ).style.display =
        isCustom
            ? "block"
            : "none";

    document.getElementById(
        "operationsSection"
    ).style.display =
        isCustom
            ? "block"
            : "none";
}

function updateAdaptiveDifficulty() {

    if (
        session.difficulty !==
        "adaptive"
    ) {
        return;
    }

    if (
        session.skillRating <= 25
    ) {
        session.maxFractionValue = 5;
        session.maxTerms = 2;
        session.operations =
            ["+", "-"];
    }
    else if (
        session.skillRating <= 50
    ) {
        session.maxFractionValue = 10;
        session.maxTerms = 3;
        session.operations =
            ["+", "-", "*"];
    }
    else if (
        session.skillRating <= 75
    ) {
        session.maxFractionValue = 20;
        session.maxTerms = 5;
        session.operations =
            ["+", "-", "*", "/"];
    }
    else {
        session.maxFractionValue = 20;
        session.maxTerms = 6;
        session.operations =
            ["+", "-", "*", "/"];
    }
}

function validateCustomSettings() {

    const startButton =
        document.getElementById(
            "startBtn"
        );

    const message =
        document.getElementById(
            "customValidationMessage"
        );

    if (
        document.getElementById(
            "difficultySelect"
        ).value !== "custom"
    ) {

        startButton.disabled =
            false;

        message.textContent =
            "";

        return;
    }

    const hasOperation =
        document.getElementById(
            "opAdd"
        ).checked ||

        document.getElementById(
            "opSubtract"
        ).checked ||

        document.getElementById(
            "opMultiply"
        ).checked ||

        document.getElementById(
            "opDivide"
        ).checked;

    if (!hasOperation) {

        startButton.disabled =
            true;

        message.textContent =
            "Select at least one operation.";

    }
    else {

        startButton.disabled =
            false;

        message.textContent =
            "";
    }
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
        () => {
            updateSettingsSummary();
            validateCustomSettings();
        }
    );

document
    .getElementById(
        "opSubtract"
    )
    .addEventListener(
        "change",
        () => {
            updateSettingsSummary();
            validateCustomSettings();
        }
    );

document
    .getElementById(
        "opMultiply"
    )
    .addEventListener(
        "change",
        () => {
            updateSettingsSummary();
            validateCustomSettings();
        }
    );

document
    .getElementById(
        "opDivide"
    )
    .addEventListener(
        "change",
        () => {
            updateSettingsSummary();
            validateCustomSettings();
        }
    );

document
    .getElementById(
        "difficultySelect"
    )
    .addEventListener(
        "change",
        () => {
            updateDifficultyVisibility();
            updateSettingsSummary();
            validateCustomSettings();
        }
    );

document
    .getElementById(
        "maxTerms"
    )
    .addEventListener(
        "input",
        updateSettingsSummary
    );

// Initialize dashboard
updateDashboard();
updateQuestionCountPreview();
updateSettingsSummary();
updateDifficultyVisibility();
validateCustomSettings();

document.getElementById(
    "answerInput"
).disabled = true;

document.getElementById(
    "submitBtn"
).disabled = true;