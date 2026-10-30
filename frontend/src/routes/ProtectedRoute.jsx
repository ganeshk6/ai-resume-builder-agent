import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openAuthModal } from '../features/auth/authModalSlice';

const ProtectedRoute = ({children}) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(openAuthModal("login"));
        }
    }, [isAuthenticated, dispatch]);

    if (!isAuthenticated) {
        return <div className="min-h-screen bg-[#090914]" />;
    }


    return children;
}

export default ProtectedRoute