socket = io.connect();

// isConnected();

// function isConnected() {
//   if (localStorage.getItem("socket")) {
//     let storage = JSON.parse(localStorage.getItem("socket"));
//     let email = storage.email;

//     if (email) {
//       heis();
//     } else {
//       heisnot();
//     }
//   } else {
//     heisnot();
//   }
// }

// function heis() {
//   let nonco = document.getElementsByClassName("nonco");
//   let forco = document.getElementsByClassName("forco");
//   console.log(nonco);
//   console.log(forco);
//   for (let i = 0; i < nonco.length; i++) {
//     nonco[i].style.display = "none";
//   }
//   for (let i = 0; i < forco.length; i++) {
//     forco[i].style.display = "initial";
//   }
// }

// function heisnot() {
//   let nonco = document.getElementsByClassName("nonco");
//   let forco = document.getElementsByClassName("forco");
//   console.log(nonco);
//   console.log(forco);
//   for (let i = 0; i < nonco.length; i++) {
//     nonco[i].style.display = "initial";
//   }
//   for (let i = 0; i < forco.length; i++) {
//     forco[i].style.display = "none";
//   }
// }

socket.on("refresh", () => {
  location.reload();
});

socket.on("handshake", data => {
  if (localStorage.getItem("socket")) {
    let storage = JSON.parse(localStorage.getItem("socket"));
    let email = storage.email;

    if (email) {
      console.log(
        `le serrveur me reconnais et je suis connecté! id : ${
          storage.id
        } // email : ${storage.email}`
      );
    } else {
      console.log(`le serrveur me reconnais mais je ne suis pas connecté!`);
    }
  } else {
    localStorage.setItem("socket", JSON.stringify({ id: data.id }));
    console.log(`le serrveur me reconnais mais je ne suis pas connecté!`);
    console.log(
      `C'est ma premiere visite et il vient de créer le localstorage`
    );
  }
});

socket.on("hug", data => {
  localStorage.setItem(
    "socket",
    JSON.stringify({ id: data.id, email: data.email, user: data.user })
  );
  // console.log(`${data}`);
  location.reload();
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
}
