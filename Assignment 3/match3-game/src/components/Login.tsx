import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getUserAsync, loginAsync, selectUser } from "../features/authSlice";

const Login = () => {
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const navigate = useNavigate();

  const handleSubmit = () => dispatch(loginAsync({ username, password }));

  useEffect(() => {
    if (currentUser.token === "") {
      return;
    }

    dispatch(
      getUserAsync({ id: currentUser.id, token: currentUser.token })
    ).then(() => {
      navigate("/");
    });
  }, [
    currentUser.id,
    currentUser.token,
    currentUser.username,
    dispatch,
    navigate,
  ]);

  return (
    <div className="login">
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
      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default Login;
