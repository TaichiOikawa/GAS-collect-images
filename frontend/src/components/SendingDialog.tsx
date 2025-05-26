import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import React from "react";

export type SendingDialogProps = {
	dialogOpen: boolean;
	sendingList: { isSuccess: boolean | null }[];
	handleDialogClose: () => void;
};

const SendingDialog: React.FC<SendingDialogProps> = ({
	dialogOpen,
	sendingList,
	handleDialogClose,
}) => {
	const progress =
		sendingList.length === 0
			? 0
			: (sendingList.filter((item) => item.isSuccess !== null).length /
					sendingList.length) *
				100;

	return (
		<Dialog open={dialogOpen}>
			<DialogContent canClose={false}>
				<DialogHeader>
					<DialogTitle>送信中</DialogTitle>
				</DialogHeader>
				<Progress value={progress} />
				<div className="space-y-2">
					{sendingList.length > 0 && (
						<p>
							{sendingList.every((item) => item.isSuccess !== null)
								? `処理が終了しました`
								: `${sendingList.filter((item) => item.isSuccess !== null).length} / ${sendingList.length} 送信中...`}
						</p>
					)}
					{sendingList.length > 0 &&
						sendingList.some((item) => item.isSuccess === false) && (
							<p className="text-red-500">
								送信に失敗しました:{" "}
								{sendingList.filter((item) => item.isSuccess === false).length}
								件
							</p>
						)}
				</div>
				{sendingList.length > 0 &&
					sendingList.every((item) => item.isSuccess !== null) && (
						<Button
							className="mt-2"
							onClick={handleDialogClose}
							variant="secondary"
						>
							閉じる
						</Button>
					)}
			</DialogContent>
		</Dialog>
	);
};

export default SendingDialog;
