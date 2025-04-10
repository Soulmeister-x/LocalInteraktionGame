const socket = io()
const spielerAuswahlDiv = document.getElementById("spieler-auswahl")
const schwebefenster = document.querySelector(".schwebefenster")
const iconLinksButton = document.getElementById("icon-links")
const aktuellesIconSpan = document.getElementById("aktuelles-icon")
const iconRechtsButton = document.getElementById("icon-rechts")
const spielerNameInput = document.getElementById("spieler-name")
const speichernButton = document.getElementById("speichern-button")
const spielFlaeche = document.getElementById("spiel-flaeche")

const verfuegbareIcons = [
  "😊",
  "⭐",
  "🚀",
  "🐱",
  "🐶",
  "🎉",
  "👹",
  "👻",
  "👽",
  "🤡",
]
let aktuellerIconIndex = 0
const tastenZustand = {}
const geschwindigkeit = 3

function updateIconAnzeige() {
  aktuellesIconSpan.textContent = verfuegbareIcons[aktuellerIconIndex]
}

iconLinksButton.addEventListener("click", () => {
  aktuellerIconIndex =
    (aktuellerIconIndex - 1 + verfuegbareIcons.length) % verfuegbareIcons.length
  updateIconAnzeige()
})

iconRechtsButton.addEventListener("click", () => {
  aktuellerIconIndex = (aktuellerIconIndex + 1) % verfuegbareIcons.length
  updateIconAnzeige()
})

speichernButton.addEventListener("click", () => {
  const name = spielerNameInput.value.trim()
  if (name) {
    const icon = aktuellesIconSpan.textContent
    socket.emit("spieler-daten", { name, icon })
    schwebefenster.style.display = "none"
  } else {
    alert("Bitte gib einen Namen ein.")
  }
})

socket.on("neuer-spieler", (spieler) => {
  console.log("Neuer Spieler:", spieler)
  zeigeSpieler(spieler)
})

socket.on("aktuelle-spieler", (alleSpieler) => {
  spielFlaeche.innerHTML = "" // Leere die Spielfläche
  for (const id in alleSpieler) {
    zeigeSpieler(alleSpieler[id])
  }
})

socket.on("spieler-bewegt", (daten) => {
  const spielerElement = document.getElementById(daten.id)
  if (spielerElement) {
    spielerElement.style.left = `${daten.x}px`
    spielerElement.style.top = `${daten.y}px`
  }
})

socket.on("spieler-verlassen", (spielerId) => {
  console.log("Spieler verlassen:", spielerId)
  const spielerElement = document.getElementById(spielerId)
  if (spielerElement) {
    spielerElement.remove()
  }
})

function zeigeSpieler(spieler) {
  const spielerDiv = document.createElement("div")
  spielerDiv.id = spieler.id
  spielerDiv.classList.add("spieler")
  spielerDiv.style.left = `${spieler.x}px`
  spielerDiv.style.top = `${spieler.y}px`
  spielerDiv.textContent = spieler.icon

  const nameAnzeige = document.createElement("div")
  nameAnzeige.classList.add("spieler-name-anzeige")
  nameAnzeige.textContent = spieler.name
  spielerDiv.appendChild(nameAnzeige)

  spielFlaeche.appendChild(spielerDiv)
}

window.addEventListener("keydown", (event) => {
  tastenZustand[event.key] = true
})

window.addEventListener("keyup", (event) => {
  tastenZustand[event.key] = false
})

function sendeBewegung() {
  let dx = 0
  let dy = 0

  if (tastenZustand["ArrowLeft"]) dx = -geschwindigkeit
  else if (tastenZustand["ArrowRight"]) dx = geschwindigkeit
  if (tastenZustand["ArrowUp"]) dy = -geschwindigkeit
  else if (tastenZustand["ArrowDown"]) dy = geschwindigkeit

  if (dx != 0 || dy != 0) {
    socket.emit("spieler-bewegung", { x: dx, y: dy })
  }

  requestAnimationFrame(sendeBewegung)
}

requestAnimationFrame(sendeBewegung)
updateIconAnzeige() // Initiales Anzeigen des Icons
