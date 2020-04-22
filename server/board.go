package main

import (
	"fmt"
)

//Board is the play grid
type Board struct {
	board  [][]string
	Width  int
	Height int
}

func (b *Board) init(w, h int) {
	b.Width = w
	b.Height = h

	b.board = make([][]string, b.Height)
	for r := range b.board {
		b.board[r] = make([]string, b.Width)
		for c := 0; c < b.Width; c++ {
			b.board[r][c] = "#"
		}
	}
}

func (b *Board) getBoard() string {
	boardStr := ""
	for r := 0; r < b.Height; r++ {
		rowStr := ""
		for c := 0; c < b.Width; c++ {
			rowStr += b.board[r][c]
		}
		boardStr += rowStr;
	}
	return fmt.Sprintf(boardStr)
}

func (b *Board) setBoard(clues map[string]Clue) {
	for _, c := range clues {
		if c.Direction == "D" {
			for i := 0; i < c.Length; i++ {
				b.board[c.Y+i][c.X] = " "
			}
		} else {
			for i := 0; i < c.Length; i++ {
				b.board[c.Y][c.X+i] = " "
			}
		}
	}
}

func (b *Board) updateBoard(board string) error {
	if len(board) != b.Width * b.Height {
		return fmt.Errorf("not a complete board")
	}

	strIndex := 0
	for r := 0; r < b.Height; r++ {
		for c := 0; c < b.Width; c++ {
			if (b.board[r][c] == " ") {
				b.board[r][c] = string(board[strIndex])
			}
			strIndex++
		}
	}
	return nil
}

func (b *Board) fillInAns(x, y, length int, direction string, word string) {
	if direction == "D" {
		for i := 0; i < length; i++ {
			b.board[y+i][x] = b.board[y+i][x][0:2] + string(word[i])
		}
	} else {
		for i := 0; i < length; i++ {
			b.board[y][x+i] = b.board[y][x+i][0:2] + string(word[i])
		}
	}
}

func (b *Board) checkWin() bool {
	for r := 0; r < b.Height; r++ {
		for c := 0; c < b.Width; c++ {
			if b.board[r][c][2] == ' ' {
				return false
			}
		}
	}
	return true
}
