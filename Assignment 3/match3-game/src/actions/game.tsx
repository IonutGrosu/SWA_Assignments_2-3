import { ADD_SCORE, BOARD_CREATED, CLEAR_CURRENT, CLEAR_MESSAGE, CLEAR_SELECTION, FINISH_GAME, FIRST_ITEM_SELECTED, MESSAGE_ERROR, SECOND_ITEM_SELECTED, SET_GAMES, SET_MESSAGE } from './types'
import { canMove, clearCurrent, create, createGame, getGame, getGames, initalScan, move, updateGame } from '../services/game.service'

import { RandomColorGenerator } from '../utils/random-color-generator';

export const createBoard = (userId: number, gameId: any) => (dispatch: any) => {
    const generator = new RandomColorGenerator();

    // Clears all matches before save in state
    const initBoard = create(generator, 4, 4);
    const { board } = initalScan(generator, initBoard);

    createGame(userId).then((data) => {
        updateGame(data.id, {
            board,
        });
    
        dispatch({
            type: BOARD_CREATED,
            payload: {
                board,
                generator,
                score: 0,
                id: data.id
            }
        })

        dispatch({
            type: CLEAR_MESSAGE,
        })
    }).catch((err) => {
        dispatch({
            type: SET_MESSAGE,
            payload: {
                message: err.message,
                type: MESSAGE_ERROR,
            },
        })
    });
}

export const getAllGames = () => (dispatch: any) => {
    getGames().then((result) => {
        dispatch({
            type: SET_GAMES,
            payload: {
                games: result.data,
            }
        })
    }).catch((err) => {
        dispatch({
            type: SET_MESSAGE,
            payload: {
                message: err.message,
                type: MESSAGE_ERROR,
            },
        })
    });
}

export const loadSaveGame = (gameId: number) => (dispatch: any) => {
    getGame(gameId).then((game) => {
        const generator = new RandomColorGenerator();
        dispatch({
            type: BOARD_CREATED,
            payload: {
                board: game.board,
                generator,
                score: game.score,
                id: gameId,
                currentMove: game.currentMove,
                firstItem: game.firstSelectedItem,
                completed: false, 
            }
        })
    }).catch((err) => {
        dispatch({
            type: SET_MESSAGE,
            payload: {
                message: err.message,
                type: MESSAGE_ERROR,
            },
        })
    });
}

export const finishGame = (gameId: number) => (dispach: any) => {
    updateGame(gameId, {
        completed: true,
    });

    dispach({
        type: FINISH_GAME,
    })
}

export const clearCurrentGame = (gameId: number) => (dispach: any) => {
    clearCurrent();
    dispach({
        type: CLEAR_CURRENT,
    })
}

export const selectFirstItem = (item: any, gameId: number) => (dispach: any) => {
    updateGame(gameId, {
        firstSelectedItem: item,
    });
    dispach({
        type: FIRST_ITEM_SELECTED,
        payload: {
            firstItem: item,
        }
    })
}

export const clearSelection = (gameId: number) => (dispatch: any) => {
    updateGame(gameId, {
        firstSelectedItem: null,
    });

    dispatch({
        type: CLEAR_SELECTION,
    });
}

export const selectSecondItem = (board: any, generator: any, firstItem: any, secondItem: any, gameId: number, points: number, currentMove: number) => (dispach: any) => {
    // Check move possiblity before save in state
    if (!canMove(board, firstItem.position, secondItem.position)) {
        return;
    }
    const result = move(generator, board, firstItem.position, secondItem.position);

    const matches = result.effects.filter((effect) => {
        return effect.kind === `Match`;
    });

    let score = 0;
    matches.forEach(() => {
        return score += 10;
    })

    updateGame(gameId, {
        score: points + score,
        board: result.board,
        firstSelectedItem: null,
        currentMove: currentMove + 1,
    });


    dispach({
        type: ADD_SCORE,
        payload: {
            point: score
        }
    });

    dispach({
        type: SECOND_ITEM_SELECTED,
        payload: {
            board: result.board
        }
    })
}