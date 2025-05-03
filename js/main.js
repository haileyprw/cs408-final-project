export function playButtonClickHandler() {
    document.querySelector(".play-button").addEventListener("click", function (event) {
        event.preventDefault();
    
        let nickname = document.getElementById("username").value;

        // Sanitize user input
        nickname = nickname.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Escape HTML characters
        nickname = nickname.trim(); // Trim any leading or trailing whitespace


        localStorage.setItem('user', nickname); // Save it globally
    
        if (!nickname) {
        nickname = "";
        }
    
        let id = Date.now().toString();
        localStorage.setItem('playerId', id); // Save it globally
    
        const data = {
        id: id,
        username: nickname,
        score: ""
        };
    
        let xhr = new XMLHttpRequest();
        xhr.open("PUT", "https://j42aj6904i.execute-api.us-east-2.amazonaws.com/nicknames");
        xhr.setRequestHeader("Content-Type", "application/json");
    
        xhr.onreadystatechange = function () {
            if (xhr.status === 200) {
                window.location.href = "./gameplay.html";
            }
        };
    
        xhr.send(JSON.stringify(data));
    });
}

export function fetchPlayerScore() {
    document.addEventListener("DOMContentLoaded", function () {
        const playerId = localStorage.getItem("playerId");

        if (playerId) {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", `https://j42aj6904i.execute-api.us-east-2.amazonaws.com/nicknames/${playerId}`);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onreadystatechange = function () {
                if (xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    let score = data.score;

                    let finalScoreElement = document.querySelector(".final-score");
                    if (finalScoreElement) {
                        if (score !== null) {
                        finalScoreElement.textContent = score;
                        }
                    }
                }
            };

            xhr.send();
        }
    });
}

playButtonClickHandler();
fetchPlayerScore();