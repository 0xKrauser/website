import { Link } from "react-router-dom";

export default function Home({}) {
	return (
		<div className="home-container">
			<img src="gooper.gif" alt="gooper" />
			<div>
				<p>Hey! There's not much here (yet)</p>
				<p>Soon(TM) I'll make a proper landing page</p>
				<p>In the meanwhile, you can check my first article:</p>
				<Link to="/ecdsa">Experiment 001: ECDSA Server</Link>
				<p>Or play with my NFT gadgets</p>
				<p>
					<Link to="/over">It's over</Link>
				</p>
				<p>
					<Link to="/whatareyouwaiting">What are you waiting for?</Link>
				</p>
				<p>
					The code for this interface is open source and available on{" "}
					<a
						href="https://github.com/0xkrauser/website"
						target="_blank"
						rel="noopener noreferrer"
					>
						GitHub
					</a>
				</p>
			</div>
			<div>
				<p>CREDITS:</p>
				<p>
					Vibes and (some) assets temporarily borrowed by Hypnospace Outlaw,
					great great game,{" "}
					<a
						href="https://store.steampowered.com/app/844590/Hypnospace_Outlaw/"
						rel="noopener noreferrer"
						target="_blank"
					>
						check it out!
					</a>
				</p>
				<p>Fonts: </p>
				<p>BM Mini by BitmapMania</p>
				<p>Somybmp by Kazuki Takada</p>
				<p>Neue Pixel Sans by Daymarius</p>
			</div>
		</div>
	);
}
