import { getPropertiesService } from "./utils";

const GOOGLE_DRIVE_FOLDER_ID = getPropertiesService("GOOGLE_DRIVE_FOLDER_ID");

export function doGet() {
	return HtmlService.createHtmlOutputFromFile("index")
		.addMetaTag("viewport", "width=device-width, initial-scale=1")
		.setTitle("画像収集システム");
}

export function imageUpload(formObject: { filename: string; data: string }) {
	console.log("imageUpload called", "fileName:", formObject.filename);
	try {
		const base64Data = formObject.data.replace(
			/^data:image\/(png|jpeg|jpg);base64,/,
			"",
		);
		const blob = Utilities.newBlob(
			Utilities.base64Decode(base64Data),
			"image/png", // 必要に応じてMIMEタイプを変更
			formObject.filename,
		);
		const folder = DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
		const file = folder.createFile(blob);
		file.getUrl();
		return {
			success: true,
		};
	} catch (e) {
		console.error("Error in imageUpload (file upload phase)", e);
		return {
			success: false,
		};
	}
}
