import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";

export const AppAct = ({ children }: { children: React.ReactNode }) => {
	const { auth } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (!auth?.auth) {
			navigate("/login");
		} else {
			navigate("/balancegeneral");
		}
	}, [auth?.auth]);

	return <>{children}</>;
};
