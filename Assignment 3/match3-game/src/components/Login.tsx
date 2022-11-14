import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login, loginAsync } from "../features/authSlice";

const Register = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = (e: any) => {
    e.preventDefault();

    dispatch(
      login({
        username: name,
        password: password,
      })
    );
    dispatch(loginAsync({ name, password }));
    console.log("clicked");
  };

  return (
    <div className="login">
      <form className="loginForm" onSubmit={(e) => handleSubmit(e)}>
        <input
          type="name"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Register;
