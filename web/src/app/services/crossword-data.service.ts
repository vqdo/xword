import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

import { Crossword, Game, Player, Clue, Direction } from '@app/models';
import { AppConfig } from '@app/app.config';

interface CrosswordResponse {
  'crossword_ids': string[];
}

interface GameResponse {
  'game_id': string;
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
      .mergeMap((res: GameResponse) => {
        return this.getGame(res.game_id);
      })
      .do((game) => {
        this.games[game.id] = game;
      });
  }

  public getGame(gameId: string): Observable<Game> {
    if (this.games[gameId]) {
      return Observable.of(this.games[gameId]);
    }

    return this.http.get(`${AppConfig.GAME_URL}/${gameId}`)
      .mergeMap((res: GameResponse) => {
        return this.http.get(`${AppConfig.GAME_URL}/${gameId}/clues`)
          .map((clueRes: CluesResponse) => {
            return new Game({
              id: gameId,
              crossword: this.extractCrossword(clueRes),
            });
          });
      });
  }

  private extractCrosswordIds(crosswordRes: CrosswordResponse) {
    return crosswordRes.crossword_ids;
  }

  private extractCrossword(clueRes: CluesResponse) {
    return new Crossword({
      clues: clueRes.clues.map((clue) => {
        return new Clue({
          number: clue.clue_number,
          position: { x: clue.x, y: clue.y },
          tileLength: clue.length,
          hint: clue.hint,
          direction: clue.direction,
        });
      }),
    });
  }
}
