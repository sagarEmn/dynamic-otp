import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RiskProvider } from "./context/RiskContext.jsx";
import PhoneFrame from "./components/PhoneFrame.jsx";
import TransactionForm from "./screens/TransactionForm.jsx";
import Processing from "./screens/Processing.jsx";
import OtpScreen from "./screens/OtpScreen.jsx";
import Success from "./screens/Success.jsx";
import Admin from "./screens/Admin.jsx";

export default function App() {
  return (
    <RiskProvider>
      <BrowserRouter>
        <Routes>
          {/* All consumer screens render inside the phone frame */}
          <Route element={<PhoneFrame />}>
            <Route path="/" element={<TransactionForm />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/otp" element={<OtpScreen />} />
            <Route path="/success" element={<Success />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RiskProvider>
  );
}
