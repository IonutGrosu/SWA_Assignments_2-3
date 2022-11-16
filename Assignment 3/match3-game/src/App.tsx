import { Route, Routes } from "react-router";
import Login from "./pages/login/Login";
import { Main } from "./pages/main/Main";
import { Register } from "./pages/register/Register";

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
