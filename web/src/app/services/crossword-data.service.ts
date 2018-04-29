import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Crossword, Game, Player, Clue, Direction } from '@app/models';
import { AppConfig } from '@app/app.config';

interface CrosswordResponse {
  'crossword_ids': string[];
}

interface NewGameResponse {
  'game_id': string;
}

interface GameResponse {
  'board_height': number;
  'board_state': string;
  'board_width': number;
}

interface CluesResponse {
  'clues': Array<{
    'clue_number': number;
    'direction': Direction,
    'x': number,
    'y': number,
    'length': number,
    'hint': string,
    'answer': string,
  }>;
}

@Injectable()
export class CrosswordDataService {

  private games: { [id: string]: Game } = {};

  constructor(public http: HttpClient) { }

  public getPuzzles(): Observable<string[]> {
    return this.http.get(`${AppConfig.BASE_URL}/crosswords`)
      .map((crosswordRes: CrosswordResponse) => this.extractCrosswordIds(crosswordRes));
  }

  public createNewGame(crosswordId: String, opponent?: Player): Observable<Game> {
    const data = {
      'crossword_id': crosswordId,
      'player_ids': ['eric', 'victoria'],
    };

    return this.http.post(AppConfig.GAME_URL, JSON.stringify(data))
      .mergeMap((res: NewGameResponse) => {
        return this.getGame(res.game_id);
      })
      .do((game) => {
        this.games[game.id] = game;
      });
  }

  public getGame(gameId: string): Observable<Game> {
    return this.http.get(`${AppConfig.GAME_URL}/${gameId}`)
      .mergeMap((res: GameResponse) => {
        return this.http.get(`${AppConfig.GAME_URL}/${gameId}/clues`)
          .map((clueRes: CluesResponse) => this.extractClues(clueRes))
          .map((clues: Clue[]) => {
            const game = new Game({
              id: gameId,
              crossword: this.extractCrossword(res, clues),
            });
            game.deserializeBoard(res.board_state);
            return game;
          });
      });
  }

  public uploadGame(game: Game): Observable<any> {
    const boardStr = game.serializeBoard();
    const data = {
      'board_state': boardStr,
    };
    return this.http.post(`${AppConfig.GAME_URL}/${game.id}`, JSON.stringify(data));
  }

  public sync(game: Game): Observable<Game> {
    return this.uploadGame(game)
      .mergeMap(() => {
        return this.getGame(game.id);
      });
  }

  private extractCrosswordIds(crosswordRes: CrosswordResponse) {
    return crosswordRes.crossword_ids;
  }

  private extractCrossword(res: GameResponse, clues: Clue[]) {
    return new Crossword({
      clues: clues,
      width: res.board_width,
      height: res.board_height,
    });
  }

  private extractClues(clueRes: CluesResponse): Clue[] {
    return clueRes.clues.map((clue) => {
      return new Clue({
        number: clue.clue_number,
        position: { row: clue.y, col: clue.x },
        tileLength: clue.length,
        hint: clue.hint,
        direction: clue.direction,
        answer: clue.answer,
      });
    });
  }
}
