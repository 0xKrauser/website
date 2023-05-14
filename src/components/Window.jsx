export default function Windows({ title, children }) {
	return (
		<div className="modal">
			<div className="modal-border-top">
				<p className="modal-title">{title}</p>
				<button className="close-button cursor-pointer">
					<img src="close-button.png" alt="Close Window" draggable={false} />
				</button>
			</div>
			<div className="modal-border-horizontal">
				<div className="subtitle-container"></div>
				<div className="border-container">{children}</div>
			</div>
		</div>
	);
}
