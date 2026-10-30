import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-[#090914] text-white">
            <Header />

            <main className="min-h-[80vh]">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default PublicLayout;