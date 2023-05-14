export default function SeedWallet({ enabled, balance, onSeed }) {
	return (
		<div className="container wallet">
			<div
				style={{ display: "flex", flexDirection: "column", margin: "8px 0" }}
			>
				<p>Current Balance: {balance}</p>
				Message: `seedMe(0)`
			</div>
			<div className="button-container">
				<button disabled={!enabled} onClick={() => onSeed()}>
					<p>Sign</p>
				</button>
			</div>
		</div>
	);
}
