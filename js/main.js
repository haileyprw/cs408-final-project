document.querySelector(".play-button").addEventListener("click", function (event) {
    event.preventDefault();
  
    let nickname = document.getElementById("username").value;
  
    if (!nickname) {
      nickname = "";
    }
  
    const id = Date.now().toString();
  
    const data = {
      id: id,
      username: nickname,
      score: 23,
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
  