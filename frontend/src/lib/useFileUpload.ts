import { useEffect, useMemo, useRef, useState } from "react";

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
		const MAX_FILES = 100;
		const newFileArray = [
			...selectedFileArray,
			...Array.from(e.target.files),
		].filter(
			(file, index, self) =>
				self.findIndex((f) => f.name === file.name) === index,
		);

		if (newFileArray.length > MAX_FILES) {
			alert(`ファイルは最大${MAX_FILES}件までです。`);
			newFileArray.length = MAX_FILES;
		}

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

		const BATCH_SIZE = 20;
		try {
			for (
				let batchStart = 0;
				batchStart < selectedFileArray.length;
				batchStart += BATCH_SIZE
			) {
				const batchFiles = selectedFileArray.slice(
					batchStart,
					batchStart + BATCH_SIZE,
				);

				// Upload images
				await Promise.all(
					batchFiles.map(async (file, i) => {
						const globalIdx = batchStart + i;
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
											idx === globalIdx
												? { ...item, isSuccess: result.success }
												: item,
										),
									);
									resolve();
								})
								.withFailureHandler(() => {
									setSendingList((prev) =>
										prev.map((item, idx) =>
											idx === globalIdx ? { ...item, isSuccess: false } : item,
										),
									);
									resolve();
								})
								.imageUpload({ filename: file.name, data: base64 });
						});
					}),
				);
			}
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

	useEffect(() => {
		if (dialogOpen) {
			const handler = (e: BeforeUnloadEvent) => {
				e.preventDefault();
			};
			window.addEventListener("beforeunload", handler);
			return () => {
				window.removeEventListener("beforeunload", handler);
			};
		}
	}, [dialogOpen]);

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
