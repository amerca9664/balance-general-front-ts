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
			className="w-full max-w-md p-2 rounded-md text-gray-900 bg-white border border-gray-300 dark:text-blue-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500"
			type={typeInput}
			value={valueText}
			onChange={(e) => onChangeText(e.target.value)}
			placeholder={placeholderText}
		/>
	);
};
