// Load all database entries
document.addEventListener("DOMContentLoaded", function () {
    const highScoresList = document.getElementById("high-scores-table");
  
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://j42aj6904i.execute-api.us-east-2.amazonaws.com/nicknames");
  
    xhr.onreadystatechange = function () {
      if (xhr.status === 200) {
        const players = JSON.parse(xhr.responseText);
        const table = document.getElementById("high-scores-table");
        table.innerHTML = `
            <tr>
                <th>Player</th>
                <th>Score</th>
            </tr>
        `;
        players.forEach(player => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${player.username}</td>
                <td>${player.score}</td>
                <td><button class="delete-button">Delete</button></td>
            `;
            table.appendChild(row);
        });
      }
    };
  
    xhr.send();
  });