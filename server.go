package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"path"
	"strings"

	"github.com/gorilla/mux"
)

var games map[string]*Game

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func randStringBytes(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}

func newGameHandler(w http.ResponseWriter, r *http.Request) {
	// add cors headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Player-ID")

	if r.Method == "OPTIONS" {
		return
	}

	gameID := randStringBytes(16)
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte("could not read request body"))
		return
	}
	var gameRequest NewGameRequest
	err = json.Unmarshal(body, &gameRequest)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte("could not parse request"))
		return
	}

	game := Game{
		GameID:  gameID,
		Clues:   make(map[string]Clue),
		Grid:    &Board{},
		Players: make(map[string]struct{}),
	}

	// add players to game
	for _, playerID := range gameRequest.PlayerIDs {
		game.Players[playerID] = struct{}{}
	}

	game.init()
	err = game.readCrossword(gameRequest.CrosswordID)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte("could not load crossword"))
		return
	}

	games[gameID] = &game

	var gameResponse NewGameResponse
	gameResponse.GameID = gameID
	payload, err := json.Marshal(gameResponse)
	if err != nil {
		w.WriteHeader(500)
		w.Write([]byte("internal server error"))
	}

	_, err = w.Write(payload)
	if err != nil {
		log.Println("could not write to client")
	}
}

func getGame(gameID, playerID string) (*Game, error) {
	game, ok := games[gameID]
	if !ok {
		return nil, fmt.Errorf("no active games with id: %s", gameID)
	}

	_, ok = game.Players[playerID]
	if !ok {
		return nil, fmt.Errorf("you are not part of this game")
	}

	return game, nil
}

func existingGameHandler(w http.ResponseWriter, r *http.Request) {
	// add cors headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Player-ID")

	if r.Method == "OPTIONS" {
		return
	}

	vars := mux.Vars(r)
	gameID := vars["gameID"]
	if len(gameID) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("no game id provided"))
		return
	}

	playerID := r.Header.Get("Player-ID")
	if len(playerID) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("no Player-ID header provided"))
		return
	}

	game, err := getGame(gameID, playerID)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte(fmt.Sprintf("game id: %s not found or you are not part of it", gameID)))
		return
	}
	boardStr := game.Grid.getBoard()

	var stateRequest GameStateRequest
	stateRequest.BoardState = boardStr
	stateRequest.BoardWidth = game.Grid.Width
	stateRequest.BoardHeight = game.Grid.Height

	payload, err := json.Marshal(stateRequest)
	if err != nil {
		w.WriteHeader(500)
		w.Write([]byte("internal server error"))
		return
	}

	_, err = w.Write(payload)
	if err != nil {
		log.Println("could not write to client")
	}
}

func getCluesHandler(w http.ResponseWriter, r *http.Request) {
	// add cors headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Player-ID")

	if r.Method == "OPTIONS" {
		return
	}

	vars := mux.Vars(r)
	gameID := vars["gameID"]
	if len(gameID) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("no game id provided"))
		return
	}

	playerID := r.Header.Get("Player-ID")
	if len(playerID) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("no Player-ID header provided"))
		return
	}

	game, err := getGame(gameID, playerID)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte(fmt.Sprintf("game id: %s not found or you are not part of it", gameID)))
		return
	}

	var cluesResponse Clues
	var clues []Clue
	for _, c := range game.Clues {
		clues = append(clues, c)
	}
	cluesResponse.Clues = clues
	payload, err := json.Marshal(cluesResponse)
	if err != nil {
		w.WriteHeader(500)
		w.Write([]byte("internal server error"))
		return
	}

	w.Write(payload)
}

func submitAnswerHandler(w http.ResponseWriter, r *http.Request) {
	// add cors headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Player-ID")

	if r.Method == "OPTIONS" {
		return
	}

	vars := mux.Vars(r)
	gameID := vars["gameID"]
	if len(gameID) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("no game id provided"))
		return
	}

	clue := vars["clue"]
	if len(clue) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("no clue provided"))
		return
	}

	playerID := r.Header.Get("Player-ID")
	if len(playerID) == 0 {
		w.WriteHeader(404)
		w.Write([]byte("no Player-ID header provided"))
		return
	}

	game, err := getGame(gameID, playerID)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte(fmt.Sprintf("game id: %s not found or you are not part of it", gameID)))
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte("could not read request body"))
		return
	}
	var answerRequest SubmitAnswerRequest
	err = json.Unmarshal(body, &answerRequest)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte("could not parse request"))
		return
	}
	uppercaseAnswer := strings.ToUpper(answerRequest.Answer)

	c, ok := game.Clues[clue]
	if !ok {
		w.WriteHeader(404)
		w.Write([]byte(fmt.Sprintf("there is no clue: %s", clue)))
		return
	}

	if c.Answer == uppercaseAnswer {
		w.Write([]byte("ok"))
		solvedClue := game.Clues[clue]
		game.Grid.fillInAns(solvedClue.X, solvedClue.Y, solvedClue.Length, solvedClue.Direction, c.Answer)
	} else {
		w.Write([]byte("not ok"))
	}
}

func puzzleHandler(w http.ResponseWriter, r *http.Request) {
	// add cors headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Player-ID")

	files, err := ioutil.ReadDir("./puzzles")
	if err != nil {
		log.Println("could not read puzzles dir", "err", err)
		w.WriteHeader(500)
		w.Write([]byte("internal server error"))
		return
	}
	availableCrosswords := []string{}
	for _, f := range files {
		filename := path.Base(f.Name())
		if strings.HasSuffix(filename, ".puz") {
			availableCrosswords = append(availableCrosswords, strings.TrimRight(filename, ".puz"))
		}
	}

	var crosswordResponse CrosswordResponse
	crosswordResponse.Answer = availableCrosswords
	payload, err := json.Marshal(&crosswordResponse)
	if err != nil {
		w.WriteHeader(500)
		w.Write([]byte("internal server error"))
		return
	}
	w.Write(payload)
}

func main() {
	games = make(map[string]*Game)

	router := mux.NewRouter()
	//clues
	router.HandleFunc("/game/{gameID}/clues/{clue}", submitAnswerHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/game/{gameID}/clues", getCluesHandler).Methods("GET", "OPTIONS")
	router.HandleFunc("/game/{gameID}", existingGameHandler).Methods("GET", "OPTIONS")
	router.HandleFunc("/game", newGameHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/crosswords", puzzleHandler).Methods("GET", "OPTIONS")
	http.Handle("/", router)
	http.ListenAndServe(":9999", nil)
}
