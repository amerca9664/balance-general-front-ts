import { useTranslation } from "../../core/components/LanguageProvider";

export const BalanceGeneral = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-4 items-center bg-gray-50 dark:bg-gray-800 justify-center min-h-full">
			<h1 className="text-gray-900 dark:text-white text-2xl font-bold">
				{t.balance.title}
			</h1>
			<p className="text-gray-900 dark:text-white">{t.balance.description}</p>
		</div>
	);
};
