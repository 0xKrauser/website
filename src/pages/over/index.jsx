import { Portal } from "../../components/Portal";
import Modal from "../../components/Modal";
import { over_server } from "../../server";
import { useState, useEffect, useMemo, useRef } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import usePrevious from "../../hooks/usePrevious";
import pseudonyms from "../../constants/pseudonyms";
import { toPng } from "html-to-image";
import download from "downloadjs";
const checkable = [
	{ name: "miladys", address: "0x5Af0D9827E0c53E4799BB226655A1de152A425a5" }, // Milady
	{ name: "remilios", address: "0xd3d9ddd0cf0a5f0bfb8f7fceae075df687eaebab" }, // Remilios
];

const timeout = 60_000; // 1 minute
const customTimeout = 600_000; // 10 minutes

export default function Over() {
	const dataRef = useRef(null);
	const [modal, setModal] = useState(false);

	const [checkAgainst, setCheckAgainst] = useLocalStorage(
		"checkAgainst",
		checkable[0]
	);
	const previousCheckAgainst = usePrevious(checkAgainst);

	const [customContracts, setCustomContracts] = useLocalStorage(
		"customContracts",
		[]
	);

	const [data, setData] = useLocalStorage("contractData", []);

	const [customCheckForm, setCustomCheckForm] = useState("");
	const [customContractsForm, setCustomContractsForm] = useState([]);

	const fetch = async () => {
		console.log("fetching...");
		try {
			const { data } = await over_server.get(`data`);
			setData(data);
		} catch (e) {
			console.log(e);
		}
	};

	const fetchCustom = async (customCheck, customArray) => {
		console.log("fetching custom...");
		try {
			const { data: newData } = await over_server.post(`custom`, {
				custom: [
					customCheck || checkAgainst.address,
					...(customArray || customContracts),
				],
			});
			if (newData.length > 0) {
				setData(newData);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleOpen = () => {
		const isCustom = !(
			checkable.findIndex((c) => c.address === checkAgainst.address) > -1
		);
		setCustomCheckForm(
			isCustom || !checkAgainst.name ? checkAgainst.address : ""
		);
		setCustomContractsForm(customContracts.join(","));
		setModal(true);
	};

	const handleClose = () => {
		setCustomCheckForm("");
		setCustomContractsForm([]);
		setModal(false);
	};

	const handleSubmit = async () => {
		const checkValid = /^0x[a-fA-F0-9]{40}$/.test(customCheckForm);
		const contractArray = customContractsForm.split(",");
		const contractsValid =
			contractArray.every((c) => /^0x[a-fA-F0-9]{40}$/.test(c)) &&
			contractArray.length > 0;
		if (checkValid && contractsValid) {
			setCheckAgainst({ name: "", address: customCheckForm });
			setCustomContracts(contractArray);
			await fetchCustom(customCheckForm, contractArray);
			handleClose();
		}
	};

	const [flag, setFlag] = useState(false);
	useEffect(() => {
		const isCustom = !(
			checkable.findIndex((c) => c.address === checkAgainst.address) > -1
		);
		if (!flag) {
			isCustom ? fetchCustom() : fetch();
			setFlag(true);
		}
		const timer = setInterval(
			() => (isCustom ? fetchCustom() : fetch()),
			isCustom ? customTimeout : timeout
		);
		return () => clearInterval(timer);
	}, [checkAgainst]);

	const sortedData = useMemo(() => {
		let checkAgainstData = data.find(
			(d) => d.id.toLowerCase() === checkAgainst.address.toLowerCase()
		);

		let checkAgainstName =
			pseudonyms[checkAgainst.address]?.[1] ||
			checkAgainst.name ||
			checkAgainstData.name;

		if (!checkAgainstData) {
			checkAgainstData = data.find(
				(d) => d.id.toLowerCase() === previousCheckAgainst.address.toLowerCase()
			);

			checkAgainstName =
				pseudonyms[previousCheckAgainst?.address]?.[1] ||
				previousCheckAgainst?.name ||
				previousCheckAgainst?.name;
		}
		return data
			.filter(
				(d) =>
					checkable.findIndex(
						(c) => d.id.toLowerCase() === c.address.toLowerCase()
					) === -1 && d.id.toLowerCase() !== checkAgainst.address.toLowerCase()
			)
			.sort(
				(a, b) =>
					b.floorAsk.price.amount.native - a.floorAsk.price.amount.native
			)
			.map((d) => (
				<div key={d.id}>
					{d.floorAsk.price.amount.native /
						checkAgainstData.floorAsk.price.amount.native >
					1 ? (
						<>
							1 {pseudonyms[d.id]?.[0] || d.name} ={" "}
							{(
								d.floorAsk.price.amount.native /
								checkAgainstData.floorAsk.price.amount.native
							).toFixed(2)}{" "}
							{checkAgainstName}
						</>
					) : (
						<>It's over for {pseudonyms[d.id]?.[1] || d.name}</>
					)}
				</div>
			));
	}, [data, checkAgainst]);

	const handleRestore = async (checkable) => {
		await fetch();
		setCheckAgainst(checkable);
		handleClose();
	};

	const handleImage = () => {
		toPng(dataRef.current).then((dataUrl) => {
			download(dataUrl, `over_${Date.now()}.png`);
		});
	};
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				padding: "16px",
				minHeight: "100%",
			}}
		>
			<div ref={dataRef} style={{ padding: "2rem", marginBottom: "2rem" }}>
				{sortedData}
			</div>
			{modal && (
				<Portal>
					<Modal onClose={() => setModal(false)}>
						<div
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "row",
								gap: "16px",
								marginBottom: "32px",
							}}
						>
							<button onClick={() => handleRestore(checkable[0])}>
								Miladys
							</button>
							<button onClick={() => handleRestore(checkable[1])}>
								Remilios
							</button>
						</div>
						<div
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "column",
								gap: "32px",
							}}
						>
							<label>
								Custom:
								<input
									placeholder="Check against (contract)"
									value={customCheckForm}
									onChange={(e) => setCustomCheckForm(e.target.value)}
								></input>
							</label>
							<label>
								Contracts:
								<input
									placeholder="Contenders (array of contracts separated by comma)"
									title="Contenders (array of contracts separated by comma)"
									value={customContractsForm}
									onChange={(e) => setCustomContractsForm(e.target.value)}
								></input>
							</label>
							<button onClick={() => handleSubmit()}>custom</button>
						</div>
					</Modal>
				</Portal>
			)}
			<div className="over-button-container">
				<button onClick={() => handleImage()}>download</button>
				<button onClick={() => handleOpen(true)}>settings</button>
			</div>
		</div>
	);
}
