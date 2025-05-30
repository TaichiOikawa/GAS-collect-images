import { Button } from "@/components/ui/button";

interface FilePreviewGridProps {
	files: File[];
	onDelete: (index: number) => void;
	previewUrls: string[];
}

const FilePreviewGrid: React.FC<FilePreviewGridProps> = ({
	files,
	onDelete,
	previewUrls,
}) => {
	return (
		<div className="mx-auto grid w-fit grid-cols-2 gap-5 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-12">
			{files.map((file, index) => (
				<div
					className="relative flex flex-col items-center space-y-2 rounded border bg-white p-2"
					key={file.name}
				>
					<img
						alt={file.name}
						className="h-35 w-35 rounded border object-cover"
						src={previewUrls[index]}
					/>
					<span className="w-28 truncate text-center text-xs">{file.name}</span>
					<Button
						className="mx-auto px-4 text-sm"
						onClick={() => onDelete(index)}
						size="sm"
						variant="destructive"
					>
						削除
					</Button>
				</div>
			))}
		</div>
	);
};

export default FilePreviewGrid;
