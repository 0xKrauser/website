import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import alias from "../../constants/alias";
import { over_server } from "../../server";
import useLocalStorage from "../../hooks/useLocalStorage";
import { toPng } from "html-to-image";
import download from "downloadjs";
import { Portal } from "../../components/Portal";
import Modal from "../../components/Modal";

const DEFAULT_BUY = "0x5Af0D9827E0c53E4799BB226655A1de152A425a5";
const DEFAULT_SELL = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";

export default function What() {
	const [modal, setModal] = useState(false);
	const imageRef = useRef(null);
	const [searchParams, setSearchParams] = useSearchParams();

	const [sellParam, setSellParam] = useState(
		searchParams.get("sell") || DEFAULT_SELL
	);
	const [buyParam, setBuyParam] = useState(
		searchParams.get("buy") || DEFAULT_BUY
	);

	const [data, setData] = useLocalStorage("compareData", {
		buyData: null,
		sellData: null,
		listings: null,
	});

	const rate = useMemo(() => {
		if (!data.buyData) return 0;
		return (
			data.sellData.floorAsk.price.amount.native /
			data.buyData.floorAsk.price.amount.native
		);
	}, [data]);
	const [buyForm, setBuyForm] = useState(buyParam);
	const [sellForm, setSellForm] = useState(sellParam);

	const handleOpen = () => {
		setBuyForm(buyParam);
		setSellForm(sellParam);
		setModal(true);
	};

	const handleClose = () => {
		setBuyForm("");
		setSellForm("");
		setModal(false);
	};
	const handleSubmit = () => {
		const buyValidation = /0x[a-fA-F0-9]{40}/.test(buyForm);
		const sellValidation = /0x[a-fA-F0-9]{40}/.test(sellForm);
		if (!buyValidation || !sellValidation) return;
		setBuyParam(buyForm);
		setSellParam(sellForm);
		setSearchParams({ buy: buyForm, sell: sellForm });
		handleClose();
	};

	const handleImage = () => {
		toPng(imageRef.current).then((dataUrl) => {
			download(dataUrl, `1_what_${Date.now()}.png`);
		});
	};

	useEffect(() => {
		const fetch = async () => {
			const { data } = await over_server.get(
				`compare/?buy=${buyParam}&sell=${sellParam}`
			);
			const buyData =
				data[
					data.findIndex((d) => d.id.toLowerCase() === buyParam.toLowerCase())
				];
			const sellData =
				data[
					data.findIndex((d) => d.id.toLowerCase() === sellParam.toLowerCase())
				];

			const rate =
				sellData.floorAsk.price.amount.native /
				buyData.floorAsk.price.amount.native;
			const listings = rate < 1 ? 1 : rate > 50 ? 50 : Math.floor(rate);
			const { data: listingsData } = await over_server.get(
				`listings/?max=${listings + 5}&contract=${buyParam}`
			);
			setData({ buyData, sellData, listings: listingsData });
		};
		fetch();
	}, [sellParam, buyParam]);

	const [memoData, memoLength] = useMemo(() => {
		if (!data.listings) return [null, 0];
		const { listings } = data.listings.reduce(
			(acc, listing) => {
				const loc = acc;
				if (loc.indexes.indexOf(listing.criteria.data.token.tokenId) > -1)
					return loc;
				if (loc.budget - listing.price.amount.native > 0) {
					loc.budget -= listing.price.amount.native;
					loc.listings.push(listing);
					loc.indexes.push(listing.criteria.data.token.tokenId);
				}
				return loc;
			},
			{
				budget: data.sellData.floorAsk.price.amount.native,
				listings: [],
				indexes: [],
			}
		);
		return [
			listings.map((listing, i) => {
				if (i < 9)
					return (
						<a
							key={listing.criteria.data.token.name}
							href={
								listing.source.url.split("/assets/")[0] +
								"/assets/ethereum/" +
								listing.source.url.split("/assets/")[1]
							}
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src={listing.criteria.data.token.image}
								alt=""
								width="100px"
							/>
							{listing.criteria.data.token.name}
						</a>
					);
			}),
			listings.length,
		];
	}, [data]);

	return !data.buyData ? (
		<div>Loadin'</div>
	) : (
		<div>
			<div
				ref={imageRef}
				style={{
					textAlign: "center",
					padding: "1rem",
					backgroundColor: "black",
				}}
			>
				<h2>
					With 1 {alias?.[sellParam]?.[0] || data.sellData?.name} you could buy{" "}
					{rate.toFixed(2)} {alias?.[buyParam]?.[1] || data.buyData?.name}.
				</h2>

				{rate < 1 ? (
					sellParam.toLowerCase() === DEFAULT_BUY.toLowerCase() ? (
						<h2>We're coming for u</h2>
					) : (
						<h2>It's over</h2>
					)
				) : (
					<>
						<p>
							These{memoLength > 9 ? <span> 9</span> : null} butiful{" "}
							{alias?.[buyParam]?.[1] || data.buyData?.name}
							{memoLength > 9 ? <span> and more</span> : null} could be yours
						</p>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<div className={memoLength > 2 ? "nft-grid" : "nft-row"}>
								{memoData}
							</div>

							<h2>What are u waiting for???</h2>
						</div>
					</>
				)}
			</div>
			<div className="over-button-container">
				{modal && (
					<Portal>
						<Modal onClose={() => setModal(false)}>
							<div
								style={{
									width: "100%",
									display: "flex",
									flexDirection: "column",
									gap: "32px",
								}}
							>
								<label>
									From:
									<input
										placeholder="0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
										value={sellForm}
										onChange={(e) => setSellForm(e.target.value)}
									></input>
								</label>
								<label>
									To:
									<input
										placeholder="0x5Af0D9827E0c53E4799BB226655A1de152A425a5"
										value={buyForm}
										onChange={(e) => setBuyForm(e.target.value)}
									></input>
								</label>
								<button onClick={() => handleSubmit()}>Submit</button>
							</div>
						</Modal>
					</Portal>
				)}
				<button onClick={() => handleImage()}>download</button>
				<button onClick={() => handleOpen()}>settings</button>
			</div>
		</div>
	);
}
