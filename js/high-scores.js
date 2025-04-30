// Load all database entries
document.addEventListener("DOMContentLoaded", function () {
  
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

            const deleteButton = row.querySelector(".delete-button");
            deleteButton.addEventListener("click", function () {
                if (confirm(`Delete player "${player.username}"?`)) {
                    const deleteXhr = new XMLHttpRequest();
                    deleteXhr.open("DELETE", `https://j42aj6904i.execute-api.us-east-2.amazonaws.com/nicknames/${player.id}`);
                    deleteXhr.onreadystatechange = function () {
                        if (deleteXhr.status === 200) {
                            row.remove(); // Remove row from table
                        }
                    }
                    deleteXhr.send();
                }
            });
            table.appendChild(row);
        });
      }
    };
    xhr.send();
  });