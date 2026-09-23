export const GeneralButton = ({
	typeButton = "button",
	onClickButton,
	textName,
}: {
	typeButton: "button" | "submit" | "reset";
	onClickButton: () => void;
	textName: string;
}) => {
	return (
		<button
			className="bg-blue-500 text-blue-50 p-2 rounded-md hover:bg-blue-600 hover:cursor-pointer active:scale-105 "
			type={typeButton}
			onClick={onClickButton}
		>
			{textName}
		</button>
	);
};
