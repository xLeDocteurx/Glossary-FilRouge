socket = io.connect();

socket.on("handshake", data => {
  localStorage.setItem("socket", JSON.stringify({ id: data.id }));
  console.log(
    `le serrveur me reconnais, id : ${data.id} // email : ${data.email}`
  );
});

socket.on("getid", () => {
    console.log("////////////////////////// BOUYAKASHA ///////////////////////");
//   let id = localStorage.getItem("socket").id;
//   socket.emit("receveid", id);
});

// if (!localStorage.getItem("user")) {
//     console.log("il n'y a rien dans le local storage");
// } else {
//     console.log("il y a quelque chose dans le local storage");
// }
