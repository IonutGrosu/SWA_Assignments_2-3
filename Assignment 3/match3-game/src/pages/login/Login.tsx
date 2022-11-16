import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchingState,
  getUserAsync,
  loginAsync,
  selectUser,
} from "../../features/authSlice";
import "./Login.css";

const Login = () => {
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector(selectUser);

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (username !== "" && password !== "")
      dispatch(loginAsync({ username, password }));
  };

  useEffect(() => {
    if (user.token === "") {
      return;
    }

    dispatch(getUserAsync({ id: user.id, token: user.token })).then(() =>
      navigate("/")
    );
  }, [user.id, user.token, user.username, dispatch, navigate]);

  return (
    <div className="login">
      <div className="title">Match 3</div>
      <input
        type="name"
        placeholder="Username"
        value={username}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {status === fetchingState.Error && <div className="error">{error}</div>}
      <button type="submit" onClick={handleSubmit}>
        Login
      </button>
    </div>
  );
};

export default Login;
