import { Route, Routes } from "react-router";
import "./App.css";
import Login from "./components/Login";
import { Main } from "./components/Main";
import { Register } from "./components/Register";

function App() {
  return (
    <Routes>
      <Route element={<Main />} path="/" />
      <Route element={<Login />} path="/login" />
      <Route element={<Register />} path="/register" />
    </Routes>
  );
}

export default App;
