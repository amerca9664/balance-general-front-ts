export const GeneralButton = ({
	typeButton = "button",
	onClickButton,
	textName,
	disabled = false,
}: {
	typeButton: "button" | "submit" | "reset";
	onClickButton: () => void;
	textName: string;
	disabled?: boolean;
}) => {
	return (
		<button
			className="bg-blue-500 text-blue-50 p-2 rounded-md hover:bg-blue-600 hover:cursor-pointer active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 disabled:active:scale-100"
			type={typeButton}
			onClick={onClickButton}
			disabled={disabled}
		>
			{textName}
		</button>
	);
};
