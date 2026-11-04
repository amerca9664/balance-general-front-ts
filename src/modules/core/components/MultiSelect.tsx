import { X } from "lucide-react";

type Option = { _id: string; name: string };

type MultiSelectProps = {
	label: string;
	// Texto del placeholder del select ("Agregar rol").
	addLabel: string;
	removeLabel: string;
	options: Option[];
	value: string[];
	onChange: (value: string[]) => void;
};

// Select que agrega opciones como chips; cada chip se quita con su X.
export const MultiSelect = ({
	label,
	addLabel,
	removeLabel,
	options,
	value,
	onChange,
}: MultiSelectProps) => {
	const selected = options.filter((option) => value.includes(option._id));
	const available = options.filter((option) => !value.includes(option._id));

	return (
		<div className="flex flex-col gap-2">
			<label className="flex flex-col gap-1">
				<span className="text-sm">{label}</span>
				{/* Elegir una opcion la agrega y el select vuelve al placeholder. */}
				<select
					value=""
					disabled={available.length === 0}
					onChange={(e) => onChange([...value, e.target.value])}
					className="p-2 rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 focus-visible:outline-2 focus-visible:outline-blue-400"
				>
					<option value="" disabled>
						{addLabel}
					</option>
					{available.map((option) => (
						<option key={option._id} value={option._id}>
							{option.name}
						</option>
					))}
				</select>
			</label>
			{selected.length > 0 && (
				<ul className="flex flex-wrap gap-2">
					{selected.map((option) => (
						<li
							key={option._id}
							className="flex items-center gap-1 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 pl-3 pr-1 py-0.5 text-sm"
						>
							{option.name}
							<button
								type="button"
								onClick={() =>
									onChange(value.filter((id) => id !== option._id))
								}
								aria-label={`${removeLabel} ${option.name}`}
								title={removeLabel}
								className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
							>
								<X className="size-4" />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
