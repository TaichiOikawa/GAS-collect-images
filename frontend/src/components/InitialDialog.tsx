import { userIdAtom } from "@/lib/atoms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { AlertCircleIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";

const initialFormSchema = z.object({
	accept: z
		.boolean({
			required_error: "「了解しました」にチェックを入れてください",
		})
		.refine((val) => val === true, {
			message: "「了解しました」にチェックを入れてください",
		}),
	studentId: z
		.string()
		.min(4, "クラス・出席番号を入力してください")
		.max(4, "クラス・出席番号を入力してください"),
	nickname: z
		.string()
		.min(1, "ニックネームを入力してください")
		.max(15, "ニックネームは15文字以内で入力してください"),
});

const InitialDialog: React.FC = () => {
	const [userId, setUserId] = useAtom(userIdAtom);
	const [open, setOpen] = useState(false);
	const [page, setPage] = useState<number>(0);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (userId === null) {
			setOpen(true);
		}
	}, [userId]);

	const form = useForm<z.infer<typeof initialFormSchema>>({
		resolver: zodResolver(initialFormSchema),
		defaultValues: {
			studentId: "",
			nickname: "",
		},
	});
	const onSubmit = (data: z.infer<typeof initialFormSchema>) => {
		if (page === 0) {
			setPage(1);
			return;
		}
		setSubmitting(true);
		const promise = () =>
			new Promise((resolve, reject) => {
				window.google.script.run
					.withSuccessHandler(
						(
							result:
								| { success: true; userId: string }
								| { success: false; message?: string },
						) => {
							if (result.success) {
								localStorage.setItem("user-id", result.userId);
								setUserId(result.userId);
								setOpen(false);
								resolve(result.userId);
								setSubmitting(false);
								form.reset();
								setPage(0);
							} else {
								reject(
									new Error(result.message || "ユーザー登録に失敗しました"),
								);
							}
						},
					)
					.withFailureHandler((error: Error) => {
						reject(error);
					})
					.createUser({
						studentNumber: data.studentId,
						nickname: data.nickname,
					});
			});
		toast.promise(promise, {
			loading: "登録中...",
			success: "登録が完了しました！",
			error: (error) => error.message || "ユーザー登録に失敗しました",
		});
	};

	return (
		<Dialog open={open}>
			<DialogContent canClose={false} className="max-w-md">
				<DialogHeader>
					<DialogTitle>ようこそ</DialogTitle>
					<DialogDescription>
						画像収集へのご協力ありがとうございます。
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col items-center gap-4">
					{page === 0 && (
						<Alert variant="destructive">
							<AlertCircleIcon />
							<AlertTitle>注意</AlertTitle>
							<AlertDescription>
								<ul className="list-disc text-sm">
									<li>画像は広報・後夜祭等で使用させていただきます。</li>
									<li>
										同じ画像は送信しないでください。集計の際に無効になります。
									</li>
									<li>
										画像の送信には時間がかかります。気長にお待ちください。
									</li>
									<li>送信が完了するまでページを離れないでください。</li>
								</ul>
							</AlertDescription>
						</Alert>
					)}
					<Form {...form}>
						<form
							className="flex flex-col gap-2"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							{page === 0 && (
								<>
									<div className="flex w-fit items-center pb-2">
										<FormField
											control={form.control}
											name="accept"
											render={({ field }) => (
												<FormItem className="flex items-center">
													<FormControl>
														<Checkbox
															checked={field.value}
															id="terms"
															onCheckedChange={(checked) =>
																field.onChange(!!checked)
															}
														/>
													</FormControl>
													<FormLabel className="cursor-pointer" htmlFor="terms">
														了解しました
													</FormLabel>
												</FormItem>
											)}
										/>
									</div>
									<div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-nowrap">
										<div className="grid w-full grid-cols-5 gap-4">
											<FormField
												control={form.control}
												name="studentId"
												render={({ field }) => (
													<FormItem className="col-span-2">
														<FormLabel>生徒番号 (4桁)</FormLabel>
														<FormControl>
															<Input
																placeholder="例) 1203"
																{...field}
																maxLength={4}
																onChange={(e) => {
																	if (!/^\d*$/.test(e.target.value)) {
																		return;
																	}
																	field.onChange(e);
																}}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="nickname"
												render={({ field }) => (
													<FormItem className="col-span-3">
														<FormLabel>ニックネーム</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
										<div className="flex w-full gap-2 sm:w-fit">
											<div className="sm:hidden">
												{form.formState.errors.accept && (
													<p className="text-sm text-red-500">
														{form.formState.errors.accept.message}
													</p>
												)}
												{form.formState.errors.studentId && (
													<p className="text-sm text-red-500">
														{form.formState.errors.studentId.message}
													</p>
												)}
												{form.formState.errors.nickname && (
													<p className="text-sm text-red-500">
														{form.formState.errors.nickname.message}
													</p>
												)}
											</div>
											<Button className="mt-auto ml-auto" type="submit">
												OK
											</Button>
										</div>
									</div>
									<div className="hidden sm:block">
										{form.formState.errors.accept && (
											<p className="text-sm text-red-500">
												{form.formState.errors.accept.message}
											</p>
										)}
										{form.formState.errors.studentId && (
											<p className="text-sm text-red-500">
												{form.formState.errors.studentId.message}
											</p>
										)}
										{form.formState.errors.nickname && (
											<p className="text-sm text-red-500">
												{form.formState.errors.nickname.message}
											</p>
										)}
									</div>
									<p className="text-muted-foreground text-sm">
										※生徒番号: 1年2組3番 → 1203
									</p>
								</>
							)}
							{page === 1 && (
								<>
									<h2 className="font-semibold">
										下記内容で登録します。よろしいですか？
									</h2>
									<ul className="flex flex-col gap-3">
										<li>
											<span className="font-bold">生徒番号</span>
											<div className="text-2xl">
												{form.getValues("studentId")}
											</div>
										</li>
										<li>
											<span className="font-bold">ニックネーム</span>
											<div className="text-2xl">
												{form.getValues("nickname")}
											</div>
										</li>
									</ul>
									<div className="mt-4 flex justify-end gap-2">
										<Button
											disabled={submitting}
											onClick={() => setPage(0)}
											type="button"
											variant="outline"
										>
											戻る
										</Button>
										<Button disabled={submitting} type="submit">
											{submitting ? (
												<div className="flex flex-row justify-center gap-1">
													<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-100 [animation-delay:-.5s]"></div>
													<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-100 [animation-delay:-.3s]"></div>
													<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-100"></div>
												</div>
											) : (
												"登録"
											)}
										</Button>
									</div>
								</>
							)}
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default InitialDialog;
