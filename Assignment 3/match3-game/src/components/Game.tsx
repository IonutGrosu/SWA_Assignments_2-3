import { clearCurrentGame, clearSelection, createBoard, finishGame, loadSaveGame, selectFirstItem, selectSecondItem } from '../actions/game'
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { Navigate } from 'react-router-dom';
import { useEffect } from 'react'

const Game = () => {
    const dispatch = useDispatch();

    const { board, firstItem, generator, points, gameId, currentMove, maxMoves, completed } = useSelector((state: any) => { return state.game}, shallowEqual);
    const { isLoggedIn, user } = useSelector((state: any) => state.auth);
    const { message } = useSelector((state: any) => state.message);
    
    useEffect(() => {
        if (currentMove >= maxMoves) {
            dispatch((finishGame(gameId)) as any);
        }
    }, [dispatch, currentMove, board])

    useEffect(() => {
        if (gameId && !board) {
            dispatch((loadSaveGame(gameId)) as any);
        }
    }, [dispatch])

    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }

    const handleCreateBoard = () => {
        dispatch((createBoard(user.userId, gameId)) as any)
    };

    const handleClearSelection = () => {
        dispatch((clearSelection(gameId)) as any)
    }

    const handleClearBoard = () => {
        dispatch(clearCurrentGame(gameId) as any)
    }

    const handleSelecteItem = (item: any) => {
        if(completed) {
            return;
        }

        if (!firstItem) {
            dispatch((selectFirstItem(item, gameId)) as any)
            return;
        }

        dispatch((selectSecondItem(board, generator, firstItem, item, gameId, points, currentMove)) as any)
    }

    const isSelectedElement = (element: any) => {
        if (firstItem?.position.col === element.position.col && firstItem?.position.row === element.position.row) {
            return true;
        }
    }
    const renderRow = (elements: any[]) => {
        const rowToDisaply = [];

        for(let i = 0 ; i < elements.length; i++) {
            let selectedStyle = ``;
            const style = {
                backgroundColor: elements[i].value,
            };

            if (isSelectedElement(elements[i])) {
                selectedStyle = `board-item-selected`;
            }

            rowToDisaply.push(<td onClick={() => handleSelecteItem({ ...elements[i]})} key={i} className={"board-item " + selectedStyle} style={style}></td>)
        }
        return rowToDisaply;
    }

    const renderBoard = () => {
        if(!board) {
            return;
        }
        const rows = [];
        const boardToDisplay = [];

        for (let i = 0; i < board.pieces.length; i +=  board.width) {
            rows.push(board.pieces.slice(i, i +  board.width));
        }

        for(let i = 0; i < rows.length; i++) {
            boardToDisplay.push(<tr key={"row" + i}>
                {renderRow(rows[i])}
            </tr>);
        }
        return boardToDisplay;
    }

    return (
        <div>
            {!board && (
            <div className='w-100 text-center mt-4 pt-4'>
                <button className='btn btn-primary m-2' onClick={() => handleCreateBoard()}>Generate board</button>
            </div>
            )}
            {board && (<div className='title mt-3'>Points {points}</div>)}
            {board && (<div className='title mt-3'>Moves left: {maxMoves - currentMove}</div>)}
            <div className='mt-3 w-100'>
                    <table className='mx-auto position-relative'>
                        <tbody>
                            {renderBoard()}
                        </tbody>

                    {completed && (
                        <div className='overlay'>
                            <div>GAME FINISHED. YOUR SCORE: {points}</div>
                            <div>
                            <button onClick={() => {handleClearBoard(); handleCreateBoard()}} className='w-100 mt-2 text-center mx-auto btn btn-primary'>Again</button>    
                            </div>
                        </div>
                    )}
                    </table>
            </div>
            <div className='w-100 text-center'>
            {firstItem && (<button className='btn btn-primary m-2' onClick={handleClearSelection}>Clear selection</button>)}
            </div>
            {message && (<div>
                {message}
            </div>)}
            </div>
    );
}

export default Game;
