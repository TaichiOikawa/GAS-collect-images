import { Button } from "@/components/ui/button";
import React from "react";

type Props = {
	inputRef: React.RefObject<HTMLInputElement | null>;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FileSelectButton: React.FC<Props> = ({ inputRef, onChange }) => {
	return (
		<>
			<Button
				className="text-lg"
				onClick={() => inputRef.current?.click()}
				size="lg"
				variant="outline"
			>
				ファイルを選択
			</Button>
			<input
				accept="image/*"
				className="hidden"
				multiple
				onChange={onChange}
				ref={inputRef}
				type="file"
			/>
		</>
	);
};

export default FileSelectButton;
