import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logoutUserAsync, selectUser } from "../../features/authSlice";

export const Main = () => {
  const { user } = useAppSelector(selectUser);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  return (
    <div>
      {user.username}
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};
