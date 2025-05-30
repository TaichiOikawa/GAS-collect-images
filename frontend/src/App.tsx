import FilePreviewGrid from "@/components/FilePreviewGrid";
import FileSelectButton from "@/components/FileSelectButton";
import MenuDialog from "@/components/MenuDialog";
import SendingDialog from "@/components/SendingDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { userIdAtom } from "@/lib/userIdAtom";
import { useAtom } from "jotai";
import { AlignJustifyIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFileUpload } from "./lib/useFileUpload";

function App() {
	const [userId, setUserId] = useAtom(userIdAtom);
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

	const [dialogPage, setDialogPage] = useState<
		"menu" | "summarize" | "ranking" | "license"
	>("menu");
	const [summaryData, setSummaryData] = useState<{
		numberOfImages: number;
		numberOfUsers: number;
		userImages: number;
	} | null>(null);
	const [loadingSummaryData, setLoadingSummaryData] = useState(false);
	const [rankingData, setRankingData] = useState<
		| {
				userId: string;
				images: string;
				ranking: string;
		  }[]
		| null
	>(null);
	const [loadingRanking, setLoadingRanking] = useState(false);

	useEffect(() => {
		const userId = localStorage.getItem("user-id");
		if (!userId) {
			const newId = crypto.randomUUID();
			localStorage.setItem("user-id", newId);
			setUserId(newId);
		} else {
			setUserId(userId);
		}
	}, [setUserId]);

	useEffect(() => {
		if (dialogPage === "summarize") {
			setLoadingSummaryData(true);
			window.google.script.run
				.withSuccessHandler(
					(
						result:
							| {
									data: {
										numberOfImages: number;
										numberOfUsers: number;
										userImages: number;
									};
									success: true;
							  }
							| { success: false },
					) => {
						if (result.success) {
							console.log("Summary data received:", result);
							setSummaryData(result.data);
							setLoadingSummaryData(false);
						} else {
							setSummaryData(null);
							setLoadingSummaryData(false);
						}
					},
				)
				.withFailureHandler(() => {
					setSummaryData(null);
					setLoadingSummaryData(false);
				})
				.getSummary(userId);
		} else {
			setSummaryData(null);
		}
	}, [dialogPage, userId]);

	useEffect(() => {
		if (dialogPage === "ranking") {
			setLoadingRanking(true);
			window.google.script.run
				.withSuccessHandler(
					(
						result:
							| {
									data: {
										userId: string;
										images: string;
										ranking: string;
									}[];
									success: true;
							  }
							| { success: false },
					) => {
						if (!result.success) {
							setRankingData(null);
							setLoadingRanking(false);
							return;
						}
						setRankingData(result.data);
						setLoadingRanking(false);
					},
				)
				.withFailureHandler(() => {
					setRankingData(null);
					setLoadingRanking(false);
				})
				.getRanking();
		} else {
			setRankingData(null);
		}
	}, [dialogPage]);

	return (
		<div className="flex min-h-dvh flex-col">
			<header className="py-5 text-center">
				<p>北見北斗高校 生徒会執行部</p>
				<h1 className="text-3xl">画像収集システム</h1>
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
					<Dialog onOpenChange={(open) => !open && setDialogPage("menu")}>
						<DialogTrigger asChild>
							<Button className="h-12 w-12" variant="outline">
								<AlignJustifyIcon className="size-6" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<MenuDialog
								dialogPage={dialogPage}
								loadingRanking={loadingRanking}
								loadingSummaryData={loadingSummaryData}
								rankingData={rankingData}
								setDialogPage={setDialogPage}
								summaryData={summaryData}
							/>
						</DialogContent>
					</Dialog>
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
