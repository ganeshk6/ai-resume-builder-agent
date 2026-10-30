import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CreateResume from "./pages/CreateResume";
import AuthModal from "./components/AuthModal";

import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>

                <Route
                    path="/create-resume"
                    element={
                        <ProtectedRoute>
                            <CreateResume />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-resume/:sessionId"
                    element={
                        <ProtectedRoute>
                            <CreateResume />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <AuthModal />
        </BrowserRouter>
    );
}

export default App;