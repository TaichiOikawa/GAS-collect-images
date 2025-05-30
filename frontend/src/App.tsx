import FilePreviewGrid from "@/components/FilePreviewGrid";
import FileSelectButton from "@/components/FileSelectButton";
import SendingDialog from "@/components/SendingDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useFileUpload } from "./lib/useFileUpload";

function App() {
	const {
		inputRef,
		selectedFileArray,
		previewUrls,
		dialogOpen,
		sendingList,
		handleChange,
		handleDelete,
		handleDeleteAll,
		handleSend,
		handleDialogClose,
	} = useFileUpload();

	return (
		<div className="flex min-h-dvh flex-col">
			<header className="py-5 text-center">
				<p>北見北斗高校 生徒会執行部</p>
				<h1 className="text-3xl">画像収集システム</h1>
				<p className="text-lg font-bold text-red-500">
					生徒会執行部 & 放送局専用
				</p>
			</header>
			<main className="pb-10">
				<div className="flex flex-col items-center gap-5">
					<FileSelectButton inputRef={inputRef} onChange={handleChange} />
					{selectedFileArray.length === 0 && <p>ファイルを選択してください</p>}
					<FilePreviewGrid
						files={selectedFileArray}
						onDelete={handleDelete}
						previewUrls={previewUrls}
					/>
				</div>
				<div className="fixed bottom-6 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-center gap-3">
					<Button
						className="h-12 w-62 text-lg"
						disabled={selectedFileArray.length === 0}
						onClick={handleSend}
					>
						送信する ({selectedFileArray.length} 件)
					</Button>
					<Button
						className="h-12 w-12"
						disabled={selectedFileArray.length === 0}
						onClick={handleDeleteAll}
						variant="outline"
					>
						<Trash2 className="size-6 text-red-500" />
					</Button>
				</div>
			</main>

			<SendingDialog
				dialogOpen={dialogOpen}
				handleDialogClose={handleDialogClose}
				sendingList={sendingList}
			/>
		</div>
	);
}

export default App;
