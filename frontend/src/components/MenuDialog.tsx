import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { userIdAtom } from "@/lib/atoms";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { CrownIcon, NotebookTextIcon, UserIcon } from "lucide-react";
import React from "react";

export type MenuDialogProps = {
	dialogPage: "menu" | "summarize" | "ranking" | "user" | "license";
	setDialogPage: (
		page: "menu" | "summarize" | "ranking" | "user" | "license",
	) => void;
	loadingSummaryData: boolean;
	summaryData: {
		numberOfImages: number;
		numberOfUsers: number;
		userImages: number;
	} | null;
	loadingRanking: boolean;
	rankingData:
		| {
				userId: string;
				images: string;
				ranking: string;
		  }[]
		| null;
	userData?: {
		studentNumber: string | null;
		nickname: string | null;
	} | null;
	loadingUserData: boolean;
};

const MenuDialog: React.FC<MenuDialogProps> = ({
	dialogPage,
	setDialogPage,
	loadingSummaryData,
	summaryData,
	loadingRanking,
	rankingData,
	loadingUserData,
	userData,
}) => {
	const userId = useAtomValue(userIdAtom);
	return (
		<AnimatePresence mode="wait">
			{dialogPage === "ranking" ? (
				<motion.div
					animate={{ opacity: 1 }}
					className="space-y-4"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key="ranking"
					transition={{ duration: 0.25 }}
				>
					<DialogHeader className="mb-4">
						<DialogTitle>ランキング</DialogTitle>
					</DialogHeader>
					{loadingRanking ? (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					) : rankingData && rankingData.length > 0 ? (
						<div
							className="w-full overflow-y-auto"
							style={{ maxHeight: "calc(100dvh - 250px)" }}
						>
							<div className="grid grid-flow-col grid-cols-1 grid-rows-10 gap-4 overflow-y-auto min-[370px]:grid-cols-2 min-[370px]:grid-rows-5">
								{rankingData.map((row) => (
									<div
										className={`flex items-center justify-between rounded-lg border px-4 py-2 ${
											row.userId == userId && "border-blue-300 bg-blue-100"
										}`}
										key={row.userId}
									>
										<div className="flex items-center gap-2">
											<p
												className={`flex items-center justify-between gap-2 text-lg font-semibold ${
													row.ranking == "1"
														? "text-yellow-500"
														: row.ranking == "2"
															? "text-gray-500"
															: row.ranking == "3"
																? "text-orange-500"
																: ""
												}`}
											>
												{row.ranking}位{row.ranking == "1" && <CrownIcon />}
											</p>
										</div>
										<span>{row.images} 枚</span>
									</div>
								))}
							</div>
						</div>
					) : !rankingData ? (
						<p className="text-center">
							ランキングデータは現在公開されていません。
						</p>
					) : (
						<p className="text-center">ランキングデータがありません。</p>
					)}
					<Button
						className="mt-4"
						onClick={() => setDialogPage("menu")}
						variant="secondary"
					>
						戻る
					</Button>
				</motion.div>
			) : dialogPage === "summarize" ? (
				<motion.div
					animate={{ opacity: 1 }}
					className="space-y-4"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key="summarize"
					transition={{ duration: 0.25 }}
				>
					<DialogHeader className="mb-4">
						<DialogTitle>集計</DialogTitle>
					</DialogHeader>
					{loadingSummaryData ? (
						<div className="grid grid-cols-3 gap-4">
							<div className="flex flex-col items-center justify-center space-y-3">
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-14 w-20" />
							</div>
							<div className="flex flex-col items-center justify-center space-y-3">
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-14 w-20" />
							</div>
							<div className="flex flex-col items-center justify-center space-y-3">
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-14 w-20" />
							</div>
						</div>
					) : summaryData ? (
						<div className="grid grid-cols-3 gap-4">
							<div className="text-center">
								写真の数
								<br />
								<span className="text-5xl">{summaryData?.numberOfImages}</span>
							</div>
							<div className="text-center">
								ユーザー数
								<br />
								<span className="text-5xl">{summaryData?.numberOfUsers}</span>
							</div>
							<div className="text-center">
								あなたの写真
								<br />
								<span className="text-5xl">{summaryData?.userImages}</span>
							</div>
						</div>
					) : (
						<p className="text-center">集計データは現在公開されていません。</p>
					)}
					<Button onClick={() => setDialogPage("menu")} variant="secondary">
						戻る
					</Button>
				</motion.div>
			) : dialogPage === "user" ? (
				<motion.div
					animate={{ opacity: 1 }}
					className="space-y-4"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key="user"
					transition={{ duration: 0.25 }}
				>
					<DialogHeader>
						<DialogTitle>登録情報</DialogTitle>
					</DialogHeader>
					{loadingUserData ? (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					) : (
						<div className="flex flex-col gap-2">
							<p className="text-sm text-gray-500">
								あなたの登録情報は以下の通りです
							</p>
							<div className="rounded-lg border p-4">
								<p className="text-lg font-semibold">
									生徒番号: {userData?.studentNumber || "未登録"}
								</p>
								<p className="text-lg font-semibold">
									ニックネーム: {userData?.nickname || "未登録"}
								</p>
								<p className="text-lg font-semibold">
									ユーザーID:{" "}
									{userId
										? userId
												.split("-")
												.map((part, idx) =>
													idx === 0 ? part : part.replace(/./g, "*"),
												)
												.join("-")
										: "未登録"}
								</p>
							</div>
							<p className="text-sm text-gray-500">※登録情報は変更できません</p>
						</div>
					)}
					<Button onClick={() => setDialogPage("menu")} variant="secondary">
						戻る
					</Button>
				</motion.div>
			) : dialogPage === "license" ? (
				<motion.div
					animate={{ opacity: 1 }}
					className="space-y-4"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key="license"
					transition={{ duration: 0.25 }}
				>
					<DialogHeader className="mb-4">
						<DialogTitle>LICENSE</DialogTitle>
					</DialogHeader>
					<div className="rounded bg-gray-100 p-4 text-sm whitespace-pre-wrap text-gray-800">
						MIT License
						<br />
						<br />
						Copyright (c) 2025 Taichi Oikawa
						<br />
						<br />
						Permission is hereby granted, free of charge, to any person
						obtaining a copy of this software and associated documentation files
						(the "Software"), to deal in the Software without restriction,
						including without limitation the rights to use, copy, modify, merge,
						publish, distribute, sublicense, and/or sell copies of the Software,
						and to permit persons to whom the Software is furnished to do so,
						subject to the following conditions:
						<br />
						<br />
						The above copyright notice and this permission notice shall be
						included in all copies or substantial portions of the Software.
						<br />
						<br />
						THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
						EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
						MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
						NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
						BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
						ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
						CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
						SOFTWARE.
					</div>
					<Button onClick={() => setDialogPage("menu")} variant="secondary">
						戻る
					</Button>
				</motion.div>
			) : (
				<motion.div
					animate={{ opacity: 1 }}
					className="space-y-4"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key="menu"
					transition={{ duration: 0.25 }}
				>
					<DialogHeader>
						<DialogTitle>メニュー</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-2">
						<Button onClick={() => setDialogPage("summarize")}>
							<NotebookTextIcon /> 集計を見る
						</Button>
						<Button onClick={() => setDialogPage("ranking")}>
							<CrownIcon /> ランキングを見る
						</Button>
						<Button onClick={() => setDialogPage("user")}>
							<UserIcon /> 登録情報
						</Button>
					</div>
					<div className="flex flex-col">
						<Button asChild size="sm" variant="link">
							<a
								href="https://github.com/TaichiOikawa/GAS-collect-images"
								rel="noopener noreferrer"
								target="_blank"
							>
								GitHub
							</a>
						</Button>
						<Button
							onClick={() => setDialogPage("license")}
							size="sm"
							variant="link"
						>
							LICENSE
						</Button>
					</div>
					<p className="text-center text-sm text-gray-500">
						Copyright © 2025 Taichi Oikawa
					</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default MenuDialog;
