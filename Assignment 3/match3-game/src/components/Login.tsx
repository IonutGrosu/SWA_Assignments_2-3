import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getUserAsync, loginAsync, selectUser } from "../features/authSlice";

const Register = () => {
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const handleSubmit = () =>
    dispatch(loginAsync({ username, password })).then(() =>
      dispatch(getUserAsync({ id: currentUser.id, token: currentUser.token }))
    );

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
      <button type="submit" onClick={() => handleSubmit()}>
        Submit
      </button>
      <div>{currentUser.username}</div>
    </div>
  );
};

export default Register;
