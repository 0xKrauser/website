import Wallet from "./Wallet";
import DerivationPath from "./DerivationPath";
import SeedWallet from "./SeedWallet";
import SendFunds from "./SendFunds";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useState, useMemo, useEffect } from "react";
import server from "../../server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Windows from "../../components/Window";

SyntaxHighlighter.registerLanguage("javascript", js);

export default function Ecdsa() {
	const [privateKey, setPrivateKey] = useLocalStorage("privateKey", "");

	// public key and address derivation
	const [address, publicKey] = useMemo(() => {
		if (!privateKey) return [undefined, undefined];

		const publicKey = secp256k1.getPublicKey(privateKey, false);

		const hash = keccak256(publicKey.slice(1));
		const ethAddress = toHex(hash.slice(-20));

		return [`0x${ethAddress}`, toHex(publicKey)];
	}, [privateKey]);

	// state and effects for balance fetching
	const [balance, setBalance] = useState(0);
	const getBalance = async () => {
		const {
			data: { balance },
		} = await server.get(`balance/${address}`);
		setBalance(balance || 0);
	};
	useEffect(() => {
		getBalance();
	}, [address]);

	// state and effects for nonce fetching
	const [nonce, setNonce] = useState(0);
	useEffect(() => {
		async function getNonce() {
			const {
				data: { nonce },
			} = await server.get(`nonce/${address}`);
			setNonce(nonce || 0);
		}

		getNonce();
	});

	// state for derivation path computation
	const [coin, setCoin] = useState(60);
	const [account, setAccount] = useState(0);
	const [index, setIndex] = useState(0);
	const derivationPath = useMemo(() => {
		return `m/44'/${coin || 0}'/${account || 0}'/0/${index || 0}`;
	}, [coin, account, index]);

	// state and functions for the send funds Window
	const [receiver, setReceiver] = useState("");
	const [amount, setAmount] = useState(0);
	const sendFundsMessage = useMemo(() => {
		return `send(${nonce})_${receiver}_${amount}`;
	}, [nonce, receiver, amount]);

	const sendFunds = async () => {
		const hash = keccak256(utf8ToBytes(sendFundsMessage));
		const signature = secp256k1.sign(hash, privateKey);
		await server.post(`transaction`, {
			sender: address,
			message: sendFundsMessage,
			signature: JSON.stringify(
				signature,
				(key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
			),
		});
		await getBalance();
	};

	// function to seed the wallet
	const seed = async () => {
		const message = `seedMe(${nonce})`;
		const hash = keccak256(utf8ToBytes(message));
		const signature = secp256k1.sign(hash, privateKey);

		await server.post(`transaction`, {
			sender: address,
			message,
			signature: JSON.stringify(signature, (key, value) =>
				typeof value === "bigint" ? value.toString() : value
			),
		});
		await getBalance();
	};

	return (
		<div className="paragraph">
			<div className="header-col">
				<img src="map.png" alt="" height="400px" />
				<div>
					<h2>Experiments 001: ECDSA Node</h2>
					<h4>
						<a
							href="https://github.com/0xKrauser/ecdsa-server"
							target="_blank"
							rel="noreferrer noopener"
						>
							[View repo]
						</a>
					</h4>
					<p>
						This project was done as part of the Alchemy Ethereum Developer
						Bootcamp. And is presented here as an interactive blog post.
						<br />
						The first module of the course centered on the inner workings of
						blockchains and their cryptographical primitives.
						<br />
						Which is good, I had some notions on the topic but, because I was
						eager to write code, I sort of skipped the non-solidity theory part
						of other courses...
					</p>
				</div>
			</div>
			<p>
				What does ECDSA stands for? 'Elliptic Curve Digital Signature
				Algorithm', it's an algorithm for{" "}
				<a
					href="https://en.wikipedia.org/wiki/Public-key_cryptography"
					target="_blank"
					rel="noreferrer noopener"
				>
					public key cryptography
				</a>{" "}
				which makes use of{" "}
				<a
					href="https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/"
					target="_blank"
					rel="noreferrer noopener"
				>
					Elliptic Curve Theory
				</a>
				.
				<br />I won't pretend I can easily explain what any of this means
				(that's what the links are for), but, to sum it up, the task at hand is
				to mock part of a blockchain's behavior by making use of secure digital
				signature practices.
			</p>
			<p>
				I was given a draft repo with a client and a server, with some mock data
				and accounts already set up. The tasks were the following:
			</p>
			<ul>
				<li>
					Incorporate Public Key Cryptography so transfers can only be completed
					with a valid signature
				</li>
				<li>
					The person sending the transaction should have to verify that they own
					the private key corresponding to the address that is sending funds
				</li>
			</ul>
			<p>
				So far so good, Alchemy's course projects are open-ended and encourage
				you to do more, which I appreciate. So I decided to start exactly by
				complicating things for myself.
			</p>
			<h3>Enter mnemonic phrases</h3>
			<p>
				The course suggested to start by generating a random private key for the
				user with 'js-ethereum-cryptography', and while there is nothing wrong
				with this approach, no user experience onchain has ever started by
				generating just the private key.
				<br />
				So, as I said, mnemonics. They are a device to translate an array of
				entropy bits into a human readable phrase. This can then be used to
				derive private keys.
			</p>
			<p>
				I wanted to go the extra mile and I was wondering if I could make a
				custom wordlist: Yes, you can. But it's not as easy as one might think.
				The only technical requirement of a wordlist is that it contains 2048
				unique words, other requirements for widespread use are added to make it
				more human friendly and its usage less error prone. For quick reference,
				here's what a non-standardised set of rules for a wordlist could look
				like:
			</p>
			<ul>
				<li>Words are 4-8 letters long.</li>
				<li>Words can be uniquely determined typing the first 4 letters.</li>
				<li>No words with accents or hyphens.</li>
				<li>
					No words with Levehnstein distance less than 2 (Minimum Levehnstein
					distance for the full set of words is 2).
				</li>
				<li>Words are sorted according to English alphabet</li>
				<li>No words already used in other language mnemonic sets.</li>
				<li>Obscenities and bad language removed as much as possible</li>
				<li>All words must be chosen manually</li>
			</ul>
			<p>
				Could I make an Ancient Latin wordlist? Maybe Klingon? Sure! The
				mnemonics generated by these wordlists wouldn't be recognized by any
				other wallet provider though. (they should still allow importing the
				private key) So for now I chose to delay this effort and just use the
				standard english wordlist. Still I think that with widespread blockchain
				adoption exotic wordlists - as a further level of obscuration - could
				become a thing.
			</p>
			<div className="window-embed">
				<Windows title="Generate mnemonic">
					<Wallet
						derivationPath={derivationPath}
						balance={balance}
						setBalance={setBalance}
						address={address}
						setPrivateKey={setPrivateKey}
						privateKey={privateKey}
						publicKey={publicKey}
					/>
				</Windows>
			</div>
			<div>
				P.s. Does this make you want to contribute to a wordlist for your
				language?
				<br />
				Most wallets use the BIP39 wordlists. But... PRs for adding wordlists to
				BIP39 were closed in 2021. Mantainers of{" "}
				<a
					href="https://github.com/bitcoin/bips/"
					target="_blank"
					rel="noopener noreferrer"
				>
					'bitcoin/bips'
				</a>{" "}
				suggest to contribute to the{" "}
				<a
					href="https://github.com/p2w34/wlips"
					target="_blank"
					rel="noopener noreferrer"
				>
					'p2w34/wlips'
				</a>{" "}
				repo going further.
			</div>
			<h3>From mnemonic to private key</h3>
			<p>
				So I started out by using 'js-ethereum-cryptography' to generate the
				mnemonic phrase, but how could I derive a private and public key from
				it? No idea. My first thought was just to rely on 'ethers' as I usually
				do, but it felt a bit like a cheat and I wanted to understand the
				process.
				<br />I gave up on stackoverflow a long time ago but it was worth a
				shot. Too bad the answer to all questions on how to derive private key
				from mnemonic was "use ethers".
				<br />
				Luckily I found a great article on the subject by Marc Garreau,{" "}
				<a
					href="https://wolovim.medium.com/ethereum-201-hd-wallets-11d0c93c87f7"
					target="_blank"
					rel="noopener noreferrer"
				>
					Ethereum 201: HD Wallets
				</a>{" "}
				that explains the process in detail and in an approachable way.
			</p>
			<p>
				By default all private keys and addresses are generated following the
				BIP44 standard.
				<br />
				So, to derive an EVM compatible private key from a mnemonic we need to
				transform it in a seed with{" "}
				<a
					href="https://www.cs.utexas.edu/users/moore/acl2/manuals/current/manual/index-seo.php/BITCOIN____BIP39-MNEMONIC-TO-SEED"
					rel="noopener noreferrer"
					target="_blank"
				>
					PBKDF2
				</a>
				, then use the seed to generate a master private key, once we have the
				master private key we can derive the child private keys for each
				account. How do we do that? BIP44 defines derivation paths for different
				types of accounts.{" "}
			</p>
			<p>
				E.g. the derivation path for the account 0, with purpose 44 (as BIP44),
				coin type 60 (Ethereum), account 0 (which I found is pretty much unused
				by most EVM wallet providers), change 0 (0 is used for external chains
				and 1 for internal chains), address index 0 (the value that increments
				when you click on new account in Metamask):
			</p>
			<SyntaxHighlighter
				language="text"
				style={docco}
				customStyle={{ width: "100%", boxSizing: "border-box" }}
				codeTagProps={{
					style: {
						fontFamily: "inherit",
						width: "100%",
					},
				}}
			>
				{`m/44'/60'/0'/0/0
m / purpose' / coin_type' / account' / change / address_index`}
			</SyntaxHighlighter>
			<p>
				This is explained in further detail in the medium article I linked.
				<br />
				To make things short and simple I used 'js-ethereum-cryptography' to
				create the root key, derive the private key and then convert it to
				hexadecimals to have it in a more standard format.
			</p>
			<SyntaxHighlighter
				language="javascript"
				style={docco}
				customStyle={{ width: "100%", boxSizing: "border-box" }}
				codeTagProps={{
					style: {
						fontFamily: "inherit",
						width: "100%",
					},
				}}
			>
				{`const seed = await mnemonicToSeed(joinedPassphrase);
const hdKey = HDKey.fromMasterSeed(seed).derive("m/44'/60'/0'/0/0");
const key = toHex(hdKey.privateKey)`}
			</SyntaxHighlighter>
			<p>
				Try it yourself, change coin, account or index to see how the private
				and public key generated from the previous mnemonic change
			</p>

			<div className="window-embed">
				<Windows title="Derive private key">
					<DerivationPath
						derivationPath={derivationPath}
						coin={coin}
						setCoin={setCoin}
						account={account}
						setAccount={setAccount}
						index={index}
						setIndex={setIndex}
						privateKey={privateKey}
						publicKey={publicKey}
						address={address}
					/>
				</Windows>
			</div>
			<h3>From private key to public key to address</h3>
			<p>
				To each private key corresponds a public key you can always derive from
				the former, this is done with further elliptic curve operations I'm not
				big brained enough to understand. Thankfully 'js-ethereum-cryptography'
				does it for us.
				<br />
				But most blockchain users have never even seen their public key! By
				convention just an 'address' is shown, the address is a further
				transformation of the public key.
				<br />
				To compute it we take the keccak256 hash of the public key, and we slice
				off the last 20 bytes of the hash. Then we add the prefix '0x' and we
				have our EVM-friendly address.
			</p>
			<SyntaxHighlighter
				language="javascript"
				style={docco}
				customStyle={{ width: "100%", boxSizing: "border-box" }}
				codeTagProps={{
					style: {
						fontFamily: "inherit",
						width: "100%",
					},
				}}
			>
				{`const publicKey = secp256k1.getPublicKey(privateKey, false);
const hash = keccak256(publicKey.slice(1));
const ethAddress = toHex(hash.slice(-20));
return \`0x$\{ethAddress\}\`;`}
			</SyntaxHighlighter>
			<h3>Signed transactions</h3>
			<p>
				Almost there! Now we have a framework set in place for users to generate
				keys/accounts by their own. Now they can use their private key to sign
				messages and we can verify that the signature on the server side was
				created by public key X. How do we do it?
			</p>
			<p>
				The first step is to get a unique hash for the data we want to sign, we
				achieve this once again with keccak256
				<br />
				Then we use secp256k1 to sign the hash with the private key, we can
				either set the 'recovered' flag to true to get the public key from the
				signature on the server side, or we can transmit the public key along
				with the signature.
				<br />
				In the backend we can then verify that the signature is valid and
				proceed as usual.
			</p>
			<SyntaxHighlighter
				language="javascript"
				style={docco}
				customStyle={{ width: "100%", boxSizing: "border-box" }}
				codeTagProps={{
					style: {
						fontFamily: "inherit",
						width: "100%",
					},
				}}
			>
				{`const message = "Hello world";
const hash = keccak256(utf8ToBytes(message));
const signature = secp256k1.sign(hash, privateKey);`}
			</SyntaxHighlighter>
			<p>
				But wait! If we just require a random message to be signed nothing stops
				a malicious third party from replaying the transaction again and again
				if he acquires an old signature.
			</p>
			<p>To avoid this we can make use of a couple of best practices:</p>
			<ul>
				<li>
					By making our messages unique to their purpose and user-readable we
					can help the user understand what he's signing and avoid middlemen
					that might promise an outcome of a transaction but are actually making
					the user sign something else.
				</li>
				<li>
					We can add a nonce to the message, a nonce is an integer that
					increments each time a transaction is sent from an account.
					<br />
					If the signature is valid the nonce on the serverside will be
					incremented, even if the transaction errors. This ensures that it's
					always a new transaction to be signed by the original user. This way
					we can keep track of the transactions and avoid replay attacks.
				</li>
			</ul>
			<p>Our unhashed message will look like this:</p>
			<SyntaxHighlighter
				language="javascript"
				style={docco}
				customStyle={{ width: "100%", boxSizing: "border-box" }}
				codeTagProps={{
					style: {
						fontFamily: "inherit",
						width: "100%",
					},
				}}
			>
				{`const message = \`transferTo($\{nonce})_$\{userTwoAddress}_$\{amount}\`;
// transferTo(0)_0x43ddf03dbd2670c2ba5b5e00b86445d0e0ee0546_100`}
			</SyntaxHighlighter>
			<p>
				the syntax is pretty much arbitrary but it serves well the purpose of
				our demo.
			</p>
			<p>Now that you have a wallet you can top it up. Try now</p>
			<div className="window-embed">
				<Windows title="Seed your wallet">
					<SeedWallet
						enabled={!!privateKey}
						balance={balance}
						onSeed={() => seed()}
					/>
				</Windows>
			</div>
			<h3>What happens on the server?</h3>
			<p>
				On the server we take the message and check who is the signer and if it
				matches with the sender we proceed to test the nonce against the one
				stored in the database. If it's valid we increment the nonce and proceed
				with the transaction.
			</p>
			<p>
				At this point the transaction might fail (e.g. insufficient funds) but
				the nonce has already been incremented as the intent of the user was to
				send the transaction. If the user wants to send the transaction again
				(he might have transferred some funds from yet another wallet) he will
				have to sign a new message with the new nonce.
			</p>
			<SyntaxHighlighter
				language="javascript"
				style={docco}
				customStyle={{ width: "100%", boxSizing: "border-box" }}
				codeTagProps={{
					style: {
						fontFamily: "inherit",
						width: "100%",
					},
				}}
			>
				{`const sig = new secp256k1.Signature(
BigInt(signature.r),
BigInt(signature.s)
).addRecoveryBit(signature.recovery);
const signer = sig.recoverPublicKey(keccak256(utf8ToBytes(message)));
const signerAddress = \`0x$\{deriveAddress(signer.toRawBytes(false))}\`;`}
			</SyntaxHighlighter>
			<h3>Conclusion</h3>
			<p>
				The only thing left to do is to allow the user to send funds to other
				people, we follow the same process as above and achieve our result. I
				hope you enjoyed this experiment. I certainly did. I feel like this
				format is a good way to showcase a project, I was able to complete the
				tasks and embed them for the user to interact with them, all while
				trying to explain what I've learned, which is always a good memory
				device. Hope whoever reads enjoys it too and maybe I'll do some more of
				these in the future.
			</p>
			<p>
				Cya!
				<br />
				Krauser III
			</p>
			<div className="window-embed">
				<Windows title="Send funds">
					<SendFunds
						balance={balance}
						message={sendFundsMessage}
						myAddress={address}
						receiver={receiver}
						setReceiver={setReceiver}
						amount={amount}
						setAmount={setAmount}
						onSend={() => sendFunds()}
					/>
				</Windows>
			</div>
		</div>
	);
}
