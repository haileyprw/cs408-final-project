document.querySelector(".play-button").addEventListener("click", function (event) {
    event.preventDefault();
  
    let nickname = document.getElementById("username").value;
  
    if (!nickname) {
      nickname = "";
    }
  
    let id = Date.now().toString();
    localStorage.setItem('playerId', id); // Save it globally
  
    const data = {
      id: id,
      username: nickname,
      score: "",
      color: "#hw320j"
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
  