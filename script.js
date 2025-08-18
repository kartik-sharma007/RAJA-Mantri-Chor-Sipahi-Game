const roles = ["Raja", "Mantri", "Chor", "Sipahi"];
let players = [];
let scores = {};
let round = 1;
const maxRounds = 5;

let currentRoles = {};
let selectedCards = {};
let cardsRevealed = false;
let mantriGuess = null;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function assignRoles() {
    let assigned = [...roles];
    shuffle(assigned);
    let playerRoles = {};
    for (let i = 0; i < players.length; i++) {
        playerRoles[players[i]] = assigned[i];
    }
    return playerRoles;
}

function updatePointsTable() {
    const tbody = document.getElementById("points-table-body");
    tbody.innerHTML = "";
    players.forEach(p => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        tdName.textContent = p;
        const tdScore = document.createElement("td");
        tdScore.textContent = scores[p] || 0;
        tr.appendChild(tdName);
        tr.appendChild(tdScore);
        tbody.appendChild(tr);
    });
}

function showCardsForSelection() {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";
    selectedCards = {};
    cardsRevealed = false;
    mantriGuess = null;
    let rolesArr = Object.values(currentRoles);
    let shuffledCards = [...rolesArr];
    shuffle(shuffledCards);

    players.forEach((player, idx) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.dataset.player = player;
        cardDiv.dataset.idx = idx;
        cardDiv.innerHTML = `<span>Card ${idx + 1}</span>`;
        cardDiv.onclick = function () {
            if (selectedCards[player]) return;
            selectedCards[player] = shuffledCards.pop();
            cardDiv.classList.add("selected");
            cardDiv.innerHTML = `<span>${player}</span><div class="card-label">Card Selected</div>`;
            if (Object.keys(selectedCards).length === players.length) {
                setTimeout(() => askMantriGuess(), 800);
            }
        };
        container.appendChild(cardDiv);
    });
    document.getElementById("next-round-btn").style.display = "none";
}

function askMantriGuess() {
    // Find Mantri
    let mantriPlayer = players.find(p => selectedCards[p] === "Mantri");
    let chorSipahiPlayers = players.filter(p => selectedCards[p] === "Chor" || selectedCards[p] === "Sipahi");
    const container = document.getElementById("cards-container");
    container.innerHTML = `<div style="width:100%;text-align:center;"><b>${mantriPlayer} (Mantri) - Guess who is Chor?</b></div>`;
    chorSipahiPlayers.forEach(p => {
        const btn = document.createElement("button");
        btn.textContent = p;
        btn.className = "guess-btn";
        btn.onclick = function () {
            mantriGuess = p;
            revealAfterGuess(mantriPlayer, p);
        };
        container.appendChild(btn);
    });
}

function revealAfterGuess(mantriPlayer, guessedPlayer) {
    let chorPlayer = players.find(p => selectedCards[p] === "Chor");
    let sipahiPlayer = players.find(p => selectedCards[p] === "Sipahi");
    let rajaPlayer = players.find(p => selectedCards[p] === "Raja");

    let resultMsg = "";
    if (guessedPlayer === chorPlayer) {
        // Mantri sahi guess karta hai
        resultMsg = `<div style="color:green;"><b>Mantri ne sahi guess kiya! Points milenge:</b></div>`;
        addPoints(selectedCards);
    } else {
        // Mantri galat guess karta hai, Chor aur Mantri apne card swap karenge
        resultMsg = `<div style="color:red;"><b>Mantri ne galat guess kiya! Chor aur Mantri apne card swap karenge, fir points milenge:</b></div>`;
        let swappedCards = {...selectedCards};
        swappedCards[mantriPlayer] = "Chor";
        swappedCards[chorPlayer] = "Mantri";
        addPoints(swappedCards);
    }

    // Show all cards and result
    const container = document.getElementById("cards-container");
    container.innerHTML = resultMsg;
    players.forEach(p => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card revealed";
        cardDiv.innerHTML = `<span>${p}</span><div class="card-label">${selectedCards[p]}</div>`;
        container.appendChild(cardDiv);
    });

    setTimeout(() => {
        document.getElementById("next-round-btn").style.display = "inline-block";
    }, 1200);
}

function addPoints(cardSet) {
    players.forEach(p => {
        if (!scores[p]) scores[p] = 0;
        if (cardSet[p] === "Raja") scores[p] += 1000;
        if (cardSet[p] === "Mantri") scores[p] += 500;
        if (cardSet[p] === "Sipahi") scores[p] += 100;
        // Chor ko sirf galat guess par 1000 milta hai
        if (cardSet[p] === "Chor" && mantriGuess !== p) {
            // Chor ke point mantri ko milenge
            let chorPoints = 0; // Chor ke point (galat guess par)
            scores[players.find(x => cardSet[x] === "Mantri")] += chorPoints;
        }
    });
    updatePointsTable();
}

function playRound() {
    currentRoles = assignRoles();
    showCardsForSelection();
    document.getElementById("next-round-btn").onclick = function () {
        round++;
        if (round <= maxRounds) {
            document.getElementById("next-round-btn").textContent = "Next Round";
            playRound();
        } else {
            document.getElementById("game-controls").style.display = "none";
            showFinalRoles();
        }
    };
}

function showFinalRoles() {
    document.getElementById("final-result-section").style.display = "block";
    let sorted = [...players].sort((a, b) => scores[b] - scores[a]);
    let finalRoles = ["Raja", "Mantri", "Sipahi", "Chor"];
    const ul = document.getElementById("final-roles-list");
    ul.innerHTML = "";
    sorted.forEach((p, idx) => {
        const li = document.createElement("li");
        li.textContent = `${finalRoles[idx]}: ${p} (${scores[p]} points)`;
        ul.appendChild(li);
    });
}

// Handle player name form
document.getElementById("player-form").addEventListener("submit", function(e) {
    e.preventDefault();
    players = [
        this.player1.value || "Player 1",
        this.player2.value || "Player 2",
        this.player3.value || "Player 3",
        this.player4.value || "Player 4"
    ];
    scores = {};
    round = 1;
    document.getElementById("player-form-section").style.display = "none";
    document.getElementById("game-controls").style.display = "block";
    document.getElementById("final-result-section").style.display = "none";
    updatePointsTable();
    document.getElementById("next-round-btn").textContent = "Start Round";
    document.getElementById("next-round-btn").style.display = "none";
    playRound();
});