import { Spreadsheet } from "./db";
import { getPropertiesService } from "./utils";

const SPREADSHEET_ID = getPropertiesService("SPREADSHEET_ID");
const ss = new Spreadsheet().from(SPREADSHEET_ID);
const manageSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
	"Manage",
) as GoogleAppsScript.Spreadsheet.Sheet;

export function doGet() {
	const canAccess = manageSheet.getRange("D4").getValue() as boolean;
	if (!canAccess) {
		return HtmlService.createHtmlOutput("アクセスが許可されていません。");
	}
	return HtmlService.createHtmlOutputFromFile("index")
		.addMetaTag("viewport", "width=device-width, initial-scale=1")
		.setTitle("画像収集システム");
}

export function checkCanUpload() {
	const canSend = manageSheet.getRange("D5").getValue() as boolean;
	return canSend;
}

export function createImageRecord(userId: string, amount: number) {
	const lock = LockService.getScriptLock();
	try {
		lock.waitLock(10000); // 最大10秒待つ
		console.log(
			"createImageRecord called",
			"userId:",
			userId,
			"amount:",
			amount,
		);
		const imageSheet = ss.at("Images");
		const data = [];
		for (let i = 0; i < amount; i++) {
			data.push({
				id: Utilities.getUuid(),
				userId: userId,
				date: new Date().toLocaleString(),
			});
		}
		imageSheet.insert(data);
		Utilities.sleep(1000);
		return {
			success: true,
			ids: data.map((row) => row.id),
		};
	} catch (e) {
		console.error("Lock acquisition failed or error in createImageRecord", e);
		return {
			success: false,
			isError: true,
		};
	} finally {
		lock.releaseLock();
	}
}

export function imageUpload(
	id: string,
	formObject: { filename: string; data: string },
) {
	console.log(
		"imageUpload called",
		"id:",
		id,
		"fileName:",
		formObject.filename,
	);
	const imageSheet = ss.at("Images");
	const drive_folder_id = manageSheet.getRange("D9").getValue() as string;
	let fileUrl = "";
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
		const folder = DriveApp.getFolderById(drive_folder_id);
		const file = folder.createFile(blob);
		fileUrl = file.getUrl();
	} catch (e) {
		console.error("Error in imageUpload (file upload phase)", e);
		return {
			success: false,
		};
	}

	try {
		imageSheet.update(
			{
				fileName: formObject.filename,
				url: fileUrl,
			},
			{ id: id },
		);
		return {
			success: true,
		};
	} catch (e) {
		console.error("Error in imageUpload (update phase)", e);
		return {
			success: false,
		};
	}
}

export function getSummary(userId: string) {
	const canAccess = manageSheet.getRange("D6").getValue() as boolean;
	if (!canAccess) {
		return {
			success: false,
		};
	}

	const imageSheet = ss.at("Images");
	const userSheet = ss.at("Users");
	const numberOfImages = imageSheet.findAll().filter((item) => item.url).length;
	const numberOfUsers = userSheet.findAll().length;
	const user = userSheet.find({ userId: userId })[0];
	const userImage = user ? user.images : 0;

	console.log(
		"getSummary called",
		"numberOfImages:",
		numberOfImages,
		"numberOfUsers:",
		numberOfUsers,
		"userImage:",
		userImage,
		"User",
		user,
	);

	return {
		data: {
			numberOfImages: numberOfImages,
			numberOfUsers: numberOfUsers,
			userImages: userImage,
		},
		success: true,
	};
}

export function createUser({
	studentNumber,
	nickname,
}: {
	studentNumber: string;
	nickname: string;
}) {
	const lock = LockService.getScriptLock();
	try {
		lock.waitLock(10000); // 最大10秒待つ
		const userSheet = ss.at("Users");
		const userId = Utilities.getUuid();
		userSheet.insert({
			userId: userId,
			createdAt: new Date(),
			images: `=COUNTIFS(Images!B:B, "${userId}", Images!D:D, "<>")`,
			ranking: `=RANK(INDIRECT("C" & MATCH("${userId}", Users!A:A, 0)), Users!C:C, 0)`,
			studentNumber: studentNumber,
			nickname: nickname,
		});
		return {
			success: true,
			userId: userId,
		};
	} catch (e) {
		console.error("Lock acquisition failed or error in createUser", e);
		return {
			success: false,
			message: "ユーザーの作成に失敗しました。",
		};
	} finally {
		lock.releaseLock();
	}
}

export function getUserData(userId: string) {
	const userSheet = ss.at("Users");
	const user = userSheet.find({ userId: userId })[0];
	if (user) {
		console.log("getUserData called", user);
		return {
			userId: user.userId,
			createdAt:
				user.createdAt instanceof Date
					? user.createdAt.toISOString()
					: user.createdAt,
			images: user.images,
			ranking: user.ranking,
			studentNumber: user.studentNumber,
			nickname: user.nickname,
		};
	}
	return null;
}

export function getRanking() {
	const canAccess = manageSheet.getRange("D7").getValue() as boolean;
	if (!canAccess) {
		return { success: false };
	}

	const rankingSheet = ss.at("Ranking");
	const rankingData = rankingSheet.findAll();
	const newRankingData = rankingData
		.map((row) => ({
			userId: row.userId,
			images: row.images,
			ranking: row.ranking,
		}))
		.splice(0, 10);
	console.log("getRanking called", newRankingData);
	return { data: newRankingData, success: true };
}
