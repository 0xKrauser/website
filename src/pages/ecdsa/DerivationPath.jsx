export default function DerivationPath({
	privateKey,
	publicKey,
	address,
	derivationPath,
	coin,
	setCoin,
	account,
	setAccount,
	index,
	setIndex,
}) {
	const handleCoin = (_coin) => {
		if (_coin === "") setCoin("");
		if (/[0-9]/.test(_coin)) {
			setCoin(_coin);
		}
	};

	const handleAccount = (_account) => {
		if (_account === "") setAccount("");
		if (/[0-9]/.test(_account)) {
			setAccount(_account);
		}
	};

	const handleIndex = (_index) => {
		if (_index === "") setIndex("");
		if (/[0-9]/.test(_index)) {
			setIndex(_index);
		}
	};
	const handleDefault = () => {
		setCoin("60");
		setAccount("0");
		setIndex("0");
	};
	return (
		<div className="container wallet">
			<>
				<div
					style={{ display: "flex", flexDirection: "column", margin: "8px 0" }}
				>
					Derivation path: {derivationPath}
					<div className="derivation-path-container">
						<label>
							Coin
							<input
								className="passphrase-input"
								value={coin}
								onChange={(evt) => handleCoin(evt.target.value)}
							></input>
						</label>
						<label>
							Account
							<input
								className="passphrase-input"
								value={account}
								onChange={(evt) => handleAccount(evt.target.value)}
							></input>
						</label>
						<label>
							Index
							<input
								className="passphrase-input"
								value={index}
								onChange={(evt) => handleIndex(evt.target.value)}
							></input>
						</label>
					</div>
					<p style={{ overflowWrap: "break-word" }}>
						Private key:
						<br />
						{privateKey || "[Generate mnemonic first]"}
					</p>
					<p style={{ marginTop: 0, overflowWrap: "break-word" }}>
						Public key:
						<br />
						{publicKey || "[Generate mnemonic first]"}
					</p>
					<p style={{ marginTop: 0, overflowWrap: "break-word" }}>
						Address:
						<br />
						{address || "[Generate mnemonic first]"}
					</p>
				</div>
				<div className="button-container">
					<button onClick={() => handleDefault()}>
						<p>default</p>
					</button>
				</div>
			</>
		</div>
	);
}
