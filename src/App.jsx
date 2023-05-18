import { Routes, Route, Outlet, useLocation, Link } from "react-router-dom";

import "./App.scss";
import Ecdsa from "./pages/ecdsa";
import Home from "./pages/Home";
import Over from "./pages/over";
import What from "./pages/whatareyouwaiting";

// Create a root route

function Root() {
	const location = useLocation();
	return (
		<div className="BorderContainer">
			<div className="Navigation"></div>
			<div className="ViewportContainer">
				<div className="Viewport">
					<div className="Content">
						<div id="portal" />
						<Outlet />
						{location.pathname !== "/" && (
							<div className="logo-container">
								<Link to="/">
									<img src="favico.svg" alt="" />
								</Link>
							</div>
						)}
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
					<Route path="whatareyouwaiting" element={<What />} />
				</Route>
			</Routes>
		</div>
	);
}

export default App;
