import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

type Column<T> = { header: string; cell: (row: T) => ReactNode };

type DataTableProps<T extends { _id: string }> = {
	rows: T[];
	columns: Column<T>[];
	emptyText: string;
	labels: { actions: string; edit: string; delete: string };
	// Nombre de la fila para los aria-label ("Editar juan").
	rowLabel: (row: T) => string;
	onEdit: (row: T) => void;
	onDelete: (row: T) => void;
};

export const DataTable = <T extends { _id: string }>({
	rows,
	columns,
	emptyText,
	labels,
	rowLabel,
	onEdit,
	onDelete,
}: DataTableProps<T>) =>
	rows.length === 0 ? (
		<p className="text-gray-600 dark:text-gray-400">{emptyText}</p>
	) : (
		<div className="overflow-x-auto">
			<table className="w-full text-left">
				<thead className="border-b border-gray-300 dark:border-gray-600">
					<tr>
						{columns.map((column) => (
							<th key={column.header} className="py-2 pr-4 font-semibold">
								{column.header}
							</th>
						))}
						<th className="py-2">
							<span className="sr-only">{labels.actions}</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={row._id}
							className="border-b border-gray-200 dark:border-gray-700"
						>
							{columns.map((column) => (
								<td key={column.header} className="py-2 pr-4">
									{column.cell(row)}
								</td>
							))}
							<td className="py-2 flex gap-1 justify-end">
								<button
									type="button"
									onClick={() => onEdit(row)}
									aria-label={`${labels.edit} ${rowLabel(row)}`}
									title={labels.edit}
									className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
								>
									<Pencil className="size-5" />
								</button>
								<button
									type="button"
									onClick={() => onDelete(row)}
									aria-label={`${labels.delete} ${rowLabel(row)}`}
									title={labels.delete}
									className="p-1.5 rounded-md text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-gray-700 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400"
								>
									<Trash2 className="size-5" />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
