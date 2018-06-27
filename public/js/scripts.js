socket = io.connect();

socket.on("handshake", function(data) {
  console.log(`le serrveur me reconnais, id : ${data.id} // email : ${data.email}`);
});

// if (!localStorage.getItem("user")) {
//     console.log("il n'y a rien dans le local storage");
// } else {
//     console.log("il y a quelque chose dans le local storage");
// }