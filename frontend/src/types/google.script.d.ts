export {};

declare global {
	interface GoogleAppsScriptRun {
		// Google Apps Script default methods
		withSuccessHandler: <T = unknown>(
			callback: (result: T) => void,
		) => GoogleAppsScriptRun;
		withFailureHandler: (
			callback: (error: Error) => void,
		) => GoogleAppsScriptRun;

		// Custom methods
		// If you add a new method to the main.ts file, add it here
		getAppUrl: () => Promise<string>;
		checkCanUpload: () => Promise<boolean>;
		createImageRecord: (
			userId: string,
			amount: number,
		) => Promise<
			| {
					success: true;
					ids?: string[];
			  }
			| { success: false; message?: string }
		>;
		imageUpload: (
			id: string,
			formObject: {
				filename: string;
				data: string;
			},
		) => Promise<{ success: boolean }>;
		getSummary: (userId: string) => Promise<
			| {
					data: {
						numberOfImages: number;
						numberOfUsers: number;
						userImages: number;
					};
					success: true;
			  }
			| { success: false }
		>;
		createUser: ({
			studentNumber: string,
			nickname: string,
		}) => Promise<
			{ success: true; userId: string } | { success: false; message?: string }
		>;
		getUserData: (userId: string) => Promise<{
			userId: string;
			createdAt: string;
			images: string;
			ranking: string;
			studentNumber: string;
			nickname: string;
		} | null>;
		getRanking: () => Promise<
			| {
					data: {
						userId: string;
						images: string;
						ranking: string;
					}[];
					success: true;
			  }
			| { success: false }
		>;
	}

	interface Window {
		google: {
			script: {
				run: GoogleAppsScriptRun;
			};
		};
	}
}
