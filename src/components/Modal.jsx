import { createPortal } from "react-dom";

export default function Modal(props) {
	const { title, onClose, children } = props;
	return (
		<div className="backdrop">
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-border-top">
					<p className="modal-title">{title}</p>
					<button className="close-button cursor-pointer">
						<img
							src="close-button.png"
							alt="Close Window"
							draggable={false}
							onClick={() => onClose()}
						/>
					</button>
				</div>
				<div className="modal-border-horizontal">
					<div className="subtitle-container"></div>
					<div className="border-container">{children}</div>
				</div>
			</div>
		</div>
	);
}
