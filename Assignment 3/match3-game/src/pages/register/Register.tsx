import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { registerUserAsync } from "../../features/authSlice";

export const Register = () => {
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();

  const handleSubmit = () =>
    dispatch(registerUserAsync({ username, password }));

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
    </div>
  );
};
