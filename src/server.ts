import express, { Express, Request, Response } from "express"
import { createServer } from "http"
import { Server } from "socket.io"
// import { v4 as uuidv4 } from "uuid"

const app: Express = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const port = 3000

interface PlayerData {
  id: string
  name: string
  icon: string
  x: number
  y: number
}

const players: { [id: string]: PlayerData } = {}

app.use(express.static("public"))
app.use(express.json()) // Für das Parsen von JSON im Request Body

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/../public/index.html")
})

io.on("connection", (socket) => {
  console.log(
    "Ein Benutzer hat sich verbunden:",
    socket.id,
    "\nAktuelle Benutzer:",
    Object.keys(players).length
  )

  socket.on("spieler-daten", (data: { name: string; icon: string }) => {
    const playerId = socket.id
    const initialX = Math.random() * 500 // Zufällige Startkoordinate X
    const initialY = Math.random() * 300 // Zufällige Startkoordinate Y

    players[playerId] = { id: playerId, ...data, x: initialX, y: initialY }
    io.emit("neuer-spieler", players[playerId]) // Sende den neuen Spieler an alle Clients
    socket.emit("aktuelle-spieler", players) // Sende die aktuellen Spieler an den neuen Client
  })

  socket.on("spieler-bewegung", (bewegung: { x: number; y: number }) => {
    const playerId = socket.id
    if (players[playerId]) {
      players[playerId].x += bewegung.x
      players[playerId].y += bewegung.y
      io.emit("spieler-bewegt", {
        id: playerId,
        x: players[playerId].x,
        y: players[playerId].y,
      })
    }
  })

  socket.on("disconnect", () => {
    console.log("Ein Benutzer hat sich getrennt:", socket.id)
    const playerIdToRemove = Object.keys(players).find(
      (key) => players[key].id === socket.id
    )
    if (playerIdToRemove) {
      delete players[playerIdToRemove]
      io.emit("spieler-verlassen", playerIdToRemove) // Informiere alle Clients über den Ausstieg
      console.log("Restliche Spieler:\n", Object.keys(players).join("\n "))
    }
  })
})

httpServer.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`)
})
