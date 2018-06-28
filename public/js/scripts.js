socket = io.connect();

socket.on("handshake", data => {
  localStorage.setItem("socket", JSON.stringify({ id: data.id }));
  console.log(
    `le serrveur me reconnais, id : ${data.id} // email : ${data.email}`
  );
});

socket.on("hug", data => {
  localStorage.setItem(
    "socket",
    JSON.stringify({ id: data.id, email: data.email })
  );
  console.log(`${data}`);
});

// if (!localStorage.getItem("user")) {
//     console.log("il n'y a rien dans le local storage");
// } else {
//     console.log("il y a quelque chose dans le local storage");
// }
