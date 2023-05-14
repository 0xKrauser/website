import { generateMnemonic, mnemonicToSeed } from "ethereum-cryptography/bip39";
import { wordlist } from "ethereum-cryptography/bip39/wordlists/english";
import { HDKey } from "ethereum-cryptography/hdkey";
import { toHex } from "ethereum-cryptography/utils";
import { useEffect } from "react";

import useLocalStorage from "../../hooks/useLocalStorage";

export default function Wallet({ derivationPath, setPrivateKey }) {
	const [passphrase, setPassphrase] = useLocalStorage(
		"passphrase",
		Array(12).fill("")
	);

	const handleGeneratePassphrase = () => {
		const newPassphrase = generateMnemonic(wordlist, 128);

		setPassphrase(newPassphrase.split(" "));
	};

	const handlePaste = (evt) => {
		console.log(evt);
	};

	const handleChange = (evt, index) => {
		const newPassphrase = [...passphrase];
		newPassphrase[index] = evt.target.value;
		setPassphrase(newPassphrase);
	};

	const handleSpace = (evt, index) => {
		if (evt.code === "Space") {
			const allElements = document.querySelectorAll(".passphrase-input");
			allElements[index + 1].focus();
		}
	};

	const handleConnect = async () => {
		const joinedPassphrase = passphrase.join(" ");
		const seed = await mnemonicToSeed(joinedPassphrase);
		const hdKey = HDKey.fromMasterSeed(seed).derive(derivationPath);

		setPrivateKey(toHex(hdKey.privateKey));
	};

	useEffect(() => {
		if (passphrase.every((word) => word !== "")) {
			handleConnect();
		}
	}, [passphrase, derivationPath]);

	return (
		<div className="container wallet">
			<>
				Generate a passphrase to get started
				<div className="passphrase-grid">
					<div className="input-grid">
						{passphrase.map((_, index) => (
							<input
								disabled
								className="passphrase-input"
								key={`pass-word-${index}`}
								value={passphrase[index]}
								onChange={(evt) => handleChange(evt, index)}
								onKeyDown={(evt) => handleSpace(evt, index)}
								onPaste={(evt) => handlePaste(evt, index)}
							></input>
						))}
					</div>
				</div>
				<div className="button-container">
					<button onClick={() => handleGeneratePassphrase()}>
						<p>generate</p>
					</button>
				</div>
			</>
		</div>
	);
}
