socket = io.connect();

socket.on("handshake", data => {
  let storage = JSON.parse(localStorage.getItem("socket"));
  let email = storage.email;
  console.log("le cookie email est t'il présent ?");
  console.log(email);
  if (email) {
    console.log(
      `le serrveur me reconnais et je suis connecté! id : ${
        storage.id
      } // email : ${storage.email}`
    );
  } else {
    localStorage.setItem(
      "socket",
      JSON.stringify({ id: data.id, email: email })
    );
    console.log(`le serrveur me reconnais mais je ne suis pas connecté!`);
  }
});

socket.on("hug", data => {
  localStorage.setItem(
    "socket",
    JSON.stringify({ id: data.id, email: data.email, user: data.user })
  );
  console.log(`${data}`);
});

function logout() {
  localStorage.removeItem("socket");
  location.reload();
}

function likethis(thisword) {
  let storage = JSON.parse(localStorage.getItem("socket"));
  let data = {
    word: thisword,
    user: storage.user
  };
  socket.emit("likethis", data);
  console.log("likethis()");
}

function trashthislink(thisword, thisname) {
  let data = {
    word: thisword,
    name: thisname
  };
  socket.emit("trashthislink", data);
  console.log("trashthislink()");
}
