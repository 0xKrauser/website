import ReactDOM from "react-dom"; // Update this line
import { useMemo } from "react";

export const Portal = ({ children }) => {
	const el = document.querySelector("#portal");
	return useMemo(() => {
		if (!el) return null;
		return ReactDOM.createPortal(children, el);
	}, [el, children]);
};
