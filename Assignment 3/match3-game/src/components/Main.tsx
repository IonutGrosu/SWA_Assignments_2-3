import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logoutUserAsync, selectUser } from "../features/authSlice";

export const Main = () => {
  const currentUser = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser.token === "") {
      navigate("/login");
    }
  }, [currentUser.token, navigate]);

  const handleLogout = () => {
    dispatch(logoutUserAsync(currentUser.token)).then(() => {
      navigate("/login");
    });
  };

  return (
    <div>
      {currentUser.username}
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};
