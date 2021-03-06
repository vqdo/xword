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

// Middleware

func corsHandler(f http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Player-ID")
		f(w, r)
	})
}

func randStringBytes(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}

func newGameHandler(w http.ResponseWriter, r *http.Request) {
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
		GameID:      gameID,
		CrosswordID: gameRequest.CrosswordID,
		Clues:       make(map[string]Clue),
		Grid:        &Board{},
		Players:     make(map[string]struct{}),
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

	boardStr := game.Grid.getBoard()

	var gameResponse GameResponse
	gameResponse.GameID = gameID
	gameResponse.CrosswordID = gameRequest.CrosswordID
	gameResponse.BoardState = boardStr
	gameResponse.BoardWidth = game.Grid.Width
	gameResponse.BoardHeight = game.Grid.Height

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

func getGame(gameID string) (*Game, error) {
	game, ok := games[gameID]
	if !ok {
		return nil, fmt.Errorf("no active games with id: %s", gameID)
	}
	return game, nil
}

func existingGameHandler(w http.ResponseWriter, r *http.Request) {
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

	game, err := getGame(gameID)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte(fmt.Sprintf("game id: %s not found", gameID)))
		return
	}

	if r.Method == "POST" {

		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(404)
			w.Write([]byte("could not read request body"))
			return
		}
		var updateRequest GameUpdateRequest

		err = json.Unmarshal(body, &updateRequest)
		if err != nil {
			w.WriteHeader(404)
			w.Write([]byte("could not parse request"))
			return
		}

		err = game.Grid.updateBoard(updateRequest.BoardState)
		if err != nil {
			w.WriteHeader(400)
			w.Write([]byte("board state format is incorrect"))
		} else {
			w.WriteHeader(202)
		}
		return
	}

	boardStr := game.Grid.getBoard()

	var gameResponse GameResponse
	gameResponse.GameID = gameID
	gameResponse.CrosswordID = game.CrosswordID
	gameResponse.BoardState = boardStr
	gameResponse.BoardWidth = game.Grid.Width
	gameResponse.BoardHeight = game.Grid.Height

	payload, err := json.Marshal(gameResponse)
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

	game, err := getGame(gameID)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte(fmt.Sprintf("game id: %s not found", gameID)))
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

	game, err := getGame(gameID)
	if err != nil {
		w.WriteHeader(404)
		w.Write([]byte(fmt.Sprintf("game id: %s not found", gameID)))
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

func fileServerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		return
	}

	filepath := fmt.Sprintf("./dist%s", r.RequestURI)
	content, err := ioutil.ReadFile(filepath)
	if err != nil {
		// default to returning index.html
		content, err = ioutil.ReadFile("./dist/index.html")
		if err != nil {
			w.WriteHeader(404)
			return
		}
	}
	w.Write(content)
}

func redirectTLS(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://crossword.monster"+r.RequestURI, http.StatusMovedPermanently)
}

func main() {
	games = make(map[string]*Game)

	router := mux.NewRouter()
	//clues
	router.HandleFunc("/api/game/{gameID}/clues/{clue}", corsHandler(submitAnswerHandler)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/game/{gameID}/clues", corsHandler(getCluesHandler)).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/game/{gameID}", corsHandler(existingGameHandler)).Methods("GET", "POST", "OPTIONS")
	router.HandleFunc("/api/game", corsHandler(newGameHandler)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/crosswords", corsHandler(puzzleHandler)).Methods("GET", "OPTIONS")
	router.HandleFunc("/game/{gameID}", corsHandler(fileServerHandler)).Methods("GET", "OPTIONS")
	router.HandleFunc("/{file}", corsHandler(fileServerHandler)).Methods("GET", "OPTIONS")
	router.HandleFunc("/", corsHandler(fileServerHandler)).Methods("GET", "OPTIONS")
	go func() {
		redirectRouter := mux.NewRouter()
		redirectRouter.HandleFunc("/", redirectTLS)
		err := http.ListenAndServe(":80", redirectRouter)
		fmt.Printf("couldnt start server on port 80, err: %s\n", err.Error())
	}()
	err := http.ListenAndServeTLS(":443", "/etc/letsencrypt/live/crossword.monster/fullchain.pem", "/etc/letsencrypt/live/crossword.monster/privkey.pem", router)
	fmt.Printf("couldnt start server on port 443, err: %s\n", err.Error())
}
