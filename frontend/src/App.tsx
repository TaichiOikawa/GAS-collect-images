import FilePreviewGrid from "@/components/FilePreviewGrid";
import FileSelectButton from "@/components/FileSelectButton";
import InitialDialog from "@/components/InitialDialog";
import MenuDialog from "@/components/MenuDialog";
import SendingDialog from "@/components/SendingDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { userIdAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { AlignJustifyIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

	const [menuDialogOpen, setMenuDialogOpen] = useState(false);
	const [dialogPage, setDialogPage] = useState<
		"menu" | "summarize" | "ranking" | "user" | "license"
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
	const [userData, setUserData] = useState<{
		userId: string;
		createdAt: string;
		images: string;
		ranking: string;
		studentNumber: string;
		nickname: string;
	} | null>(null);
	const [loadingUserData, setLoadingUserData] = useState(false);

	useEffect(() => {
		const userId = localStorage.getItem("user-id");
		if (userId) {
			setUserId(userId);
		} else {
			setUserId(null);
		}
	}, [setUserId]);

	useEffect(() => {
		if (userId === null || userId === undefined) return;
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

	useEffect(() => {
		if (!userId) return;
		if (dialogPage === "user") {
			setLoadingUserData(true);
			window.google.script.run
				.withSuccessHandler(
					(
						result: {
							userId: string;
							createdAt: string;
							images: string;
							ranking: string;
							studentNumber: string;
							nickname: string;
						} | null,
					) => {
						if (result) {
							setUserData(result);
							setLoadingUserData(false);
						} else {
							localStorage.removeItem("user-id");
							toast.error("ユーザーデータが見つかりませんでした。");
							setUserData(null);
							setLoadingUserData(false);
							handleOpenChange(false);
							setUserId(null);
						}
					},
				)
				.withFailureHandler((error: Error) => {
					console.error("Error fetching user data:", error);
				})
				.getUserData(userId);
		} else {
			setUserData(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dialogPage]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setMenuDialogOpen(false);
			setDialogPage("menu");
			return;
		}
		setMenuDialogOpen(true);
	};

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
				<div className="fixed bottom-6 left-1/2 flex w-dvw -translate-x-1/2 justify-center gap-3 px-20">
					<Button
						className="h-12 w-full max-w-60 text-lg"
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
					<Dialog onOpenChange={handleOpenChange} open={menuDialogOpen}>
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
								loadingUserData={loadingUserData}
								rankingData={rankingData}
								setDialogPage={setDialogPage}
								summaryData={summaryData}
								userData={userData}
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

			<InitialDialog />
		</div>
	);
}

export default App;
