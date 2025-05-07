import { Routes } from "react-router-dom";
import GoldExchangeApp from "./components/GoldExchangeApp";
import LoginPage from "./pages/login/page";
import { Route } from "react-router-dom";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<GoldExchangeApp />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}
