export const GeneralInputText = ({
	valueText,
	onChangeText,
	placeholderText,
	typeInput = "text",
}: {
	valueText: string;
	onChangeText: React.Dispatch<React.SetStateAction<string>>;
	placeholderText: string;
	typeInput: string;
}) => {
	return (
		<input
			className="w-full max-w-md p-2 rounded-md text-blue-50 bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
			type={typeInput}
			value={valueText}
			onChange={(e) => onChangeText(e.target.value)}
			placeholder={placeholderText}
		/>
	);
};
