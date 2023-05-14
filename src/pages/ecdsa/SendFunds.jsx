import { useState, useEffect } from "react";
import server from "../../server";
export default function SendFunds({
	balance,
	message,
	myAddress,
	receiver,
	setReceiver,
	amount,
	setAmount,
	onSend,
}) {
	const [addresses, setAddresses] = useState({});

	const getAddresses = async () => {
		const {
			data: { balances },
		} = await server.get(`addresses`);
		setAddresses(balances || []);
	};

	useEffect(() => {
		getAddresses();
	}, [balance, message]);

	const handleAmount = (_amount) => {
		if (_amount === "") setAmount(0);
		if (/[0-9.]/.test(_amount)) {
			setAmount(_amount);
		}
	};

	return (
		<div className="container wallet">
			<>
				<div className="send-funds-container">
					<div
						className="sendContainer"
						style={{ display: "flex", flexDirection: "column" }}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "8px",
								justifyContent: "space-around",
								marginBottom: "24px",
							}}
						>
							<label>
								Amount
								<input
									className="passphrase-input"
									value={amount}
									onChange={(evt) => handleAmount(evt.target.value)}
								></input>
							</label>
							<label>
								To:
								<input
									className="passphrase-input"
									value={receiver}
									onChange={(evt) => setReceiver(evt.target.value)}
								></input>
							</label>
						</div>
						<div
							className="button-container"
							style={{ justifyContent: "start" }}
						>
							<button onClick={() => onSend()}>
								<p>Transfer</p>
							</button>
						</div>
					</div>
					<div className="address-container">
						{Object.keys(addresses).map((address, index) => (
							<button
								key={`address-button-${index}`}
								onClick={() => setReceiver(address)}
								title={address}
								disabled={address === myAddress}
							>
								<div>
									{address.slice(0, 8) + "..." + address.slice(-8)}
									{address === myAddress ? "(You)" : ""}{" "}
								</div>
								${addresses[address]}
							</button>
						))}
					</div>
				</div>
			</>
		</div>
	);
}
