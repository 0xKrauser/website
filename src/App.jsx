import { Routes, Route, Outlet } from "react-router-dom";

import "./App.scss";
import Ecdsa from "./pages/ecdsa";
import Home from "./pages/Home";
import Over from "./pages/over";

// Create a root route

function Root() {
	return (
		<div className="BorderContainer">
			<div className="Navigation"></div>
			<div className="ViewportContainer">
				<div className="Viewport">
					<div className="Content">
						<div id="portal" />
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
}

function App() {
	return (
		<div className="app">
			<Routes>
				<Route path="/" element={<Root />}>
					<Route index element={<Home />} />
					<Route path="ecdsa" element={<Ecdsa />} />
					<Route path="over" element={<Over />} />
				</Route>
			</Routes>
		</div>
	);
}

export default App;
