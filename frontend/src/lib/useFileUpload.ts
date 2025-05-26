import { useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { userIdAtom } from "./userIdAtom";

export function useFileUpload() {
	const inputRef = useRef<HTMLInputElement>(null);
	const [inputFiles, setInputFiles] = useState<FileList | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [sendingList, setSendingList] = useState<
		{
			filename: string;
			isSuccess: boolean | null;
			file: File;
			id?: string;
		}[]
	>([]);
	const [userId] = useAtom(userIdAtom);

	const selectedFileArray: File[] = useMemo(() => {
		return inputFiles ? [...Array.from(inputFiles)] : [];
	}, [inputFiles]);

	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	useEffect(() => {
		previewUrls.forEach((url) => URL.revokeObjectURL(url));
		if (!selectedFileArray.length) {
			setPreviewUrls([]);
			return;
		}
		const urls = selectedFileArray.map((file) => URL.createObjectURL(file));
		setPreviewUrls(urls);
		return () => {
			urls.forEach((url) => URL.revokeObjectURL(url));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedFileArray]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		if (!inputRef.current?.files) return;
		const newFileArray = [
			...selectedFileArray,
			...Array.from(e.target.files),
		].filter(
			(file, index, self) =>
				self.findIndex((f) => f.name === file.name) === index,
		);
		const dt = new DataTransfer();
		newFileArray.forEach((file) => dt.items.add(file));
		inputRef.current.files = dt.files;
		setInputFiles(dt.files);
	};

	const handleDelete = (index: number) => {
		if (!inputRef.current?.files) return;
		const dt = new DataTransfer();
		selectedFileArray.forEach((file, i) => i !== index && dt.items.add(file));
		inputRef.current.files = dt.files;
		setInputFiles(dt.files);
	};

	const handleDeleteAll = () => {
		setInputFiles(null);
		inputRef.current!.value = "";
	};

	const handleSend = async () => {
		if (!inputRef.current?.files) return;
		setDialogOpen(true);
		setSendingList(
			selectedFileArray.map((file) => ({
				filename: file.name,
				isSuccess: null,
				file,
			})),
		);

		try {
			// 1. Get user data
			await new Promise<void>((resolve, reject) => {
				window.google.script.run
					.withSuccessHandler(() => {
						console.log("User checked in successfully.");
						resolve();
					})
					.withFailureHandler((error: Error) => {
						console.error("Error checking in user:", error);
						reject(error);
					})
					.getUserData(userId);
			});

			// 2. Create image record
			let ids: string[] = [];
			await new Promise<void>((resolve, reject) => {
				window.google.script.run
					.withSuccessHandler(
						(result: { success: boolean; ids?: string[] }) => {
							if (result.success && result.ids) {
								ids = result.ids;
								setSendingList((prev) =>
									prev.map((item, idx) => ({
										...item,
										id: result.ids![idx],
									})),
								);
							}
							resolve();
						},
					)
					.withFailureHandler((error: Error) => {
						console.error("Error creating image record:", error);
						reject(error);
					})
					.createImageRecord(userId, selectedFileArray.length);
			});

			// 3. Upload images
			await Promise.all(
				selectedFileArray.map(async (file, i) => {
					const base64 = await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => {
							const result = reader.result as string;
							resolve(result.split(",")[1]);
						};
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});

					await new Promise<void>((resolve) => {
						window.google.script.run
							.withSuccessHandler((result: { success: boolean }) => {
								setSendingList((prev) =>
									prev.map((item, idx) =>
										idx === i ? { ...item, isSuccess: result.success } : item,
									),
								);
								resolve();
							})
							.withFailureHandler(() => {
								setSendingList((prev) =>
									prev.map((item, idx) =>
										idx === i ? { ...item, isSuccess: false } : item,
									),
								);
								resolve();
							})
							.imageUpload(ids[i], { filename: file.name, data: base64 });
					});
				}),
			);
		} catch (error) {
			console.error("Error in handleSend:", error);
			setSendingList((prev) =>
				prev.map((item) => ({
					...item,
					isSuccess: false,
				})),
			);
		}
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		const failedFileNames = sendingList
			.filter((item) => item.isSuccess === false)
			.map((item) => item.file.name);
		if (failedFileNames.length === 0) {
			handleDeleteAll();
		} else {
			const dt = new DataTransfer();
			selectedFileArray.forEach((file) => {
				if (failedFileNames.includes(file.name)) {
					dt.items.add(file);
				}
			});
			if (inputRef.current) inputRef.current.files = dt.files;
			setInputFiles(dt.files);
		}
		setSendingList([]);
	};

	return {
		inputRef,
		inputFiles,
		setInputFiles,
		dialogOpen,
		sendingList,
		selectedFileArray,
		previewUrls,
		handleChange,
		handleDelete,
		handleDeleteAll,
		handleSend,
		handleDialogClose,
		setDialogOpen,
	};
}
