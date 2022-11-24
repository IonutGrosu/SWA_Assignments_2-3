import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logoutUserAsync, selectUser } from "../../features/authSlice";

export const Main = () => {
  const { user } = useAppSelector(selectUser);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const board = {
    height: 5,
    width: 5,
    elements: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
    ],
  };

  type BoardElement = {
    value: string;
    key: number;
  };

  const mapBoard = () => {
    var boardElementsMatrix: BoardElement[][] = [];

    for (let row = 0; row < board.height; row++) {
      var rowArray: BoardElement[] = [];
      for (let col = 0; col < board.width; col++) {
        rowArray.push({
          value: board.elements[row * board.height + col],
          key: row * board.height + col,
        } as BoardElement);
      }
      boardElementsMatrix.push(rowArray);
    }
    return boardElementsMatrix;
  };

  let idk = mapBoard();

  const [betterElementsArray, setBetterElementsArray] = useState(idk);
  //setBetterElementsArray(mapBoard())

  useEffect(() => {
    if (user.token === "") {
      navigate("/login");
    }
  }, [user.token, navigate]);

  const handleLogout = () => {
    dispatch(logoutUserAsync(user.token)).then(() => {
      navigate("/login");
    });
  };

  let firstSelection: BoardElement;
  let isFirstSelected: boolean = false;
  let secondSelection: BoardElement;
  let isSecondSelected: boolean = false;

  const handleClick = (clickedElement: BoardElement) => {
    if (!isFirstSelected && !isSecondSelected) {
      firstSelection = clickedElement;
      isFirstSelected = true;
      console.log({ firstSelection });
    } else if (isFirstSelected && !isSecondSelected) {
      secondSelection = clickedElement;
      console.log({ secondSelection });
      isSecondSelected = true;
    }
    if (isFirstSelected && isSecondSelected) {
      switchElements(firstSelection, secondSelection);
      isFirstSelected = false;
      isSecondSelected = false;
    }
  };

  const switchElements = (first: BoardElement, second: BoardElement) => {
    let aux: string = board.elements[first.key];
    board.elements[first.key] = board.elements[second.key];
    board.elements[second.key] = aux;

    setBetterElementsArray(mapBoard());
    console.log(betterElementsArray);
  };

  return (
    <div>
      {user.username}
      <button onClick={handleLogout}>Log out</button>

      <div className="gameDiv">
        <table>
          <tbody>
            {betterElementsArray.map((val, keyRow) => {
              return (
                <tr>
                  {val.map((cell, key) => (
                    <td key={cell.key} onClick={() => handleClick(cell)}>
                      {cell.value}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
