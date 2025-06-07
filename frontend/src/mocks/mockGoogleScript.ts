type SuccessHandler<T = unknown> = (result: T) => void;

const mockFunctions = {
	checkCanUpload: (callback: SuccessHandler<boolean>) => {
		setTimeout(() => callback(true), 200);
	},
	createImageRecord: (
		userId: string,
		amount: number,
		callback: SuccessHandler<
			{ success: true; ids?: string[] } | { success: false; message?: string }
		>,
	) => {
		setTimeout(() => {
			console.log("Mock: Create Image Record", userId, amount);
			callback({
				success: true,
				ids: Array.from({ length: amount }, (_, i) => `mock-id-${i + 1}`),
			});
		}, 200);
	},
	imageUpload: (
		id: string,
		formObject: { filename: string; data: string },
		callback: SuccessHandler<{ success: boolean }>,
	) => {
		setTimeout(() => {
			console.log("Mock: Image Upload", id, formObject.filename);
			callback({ success: true });
		}, 200);
	},
	getSummary: (
		userId: string,
		callback: SuccessHandler<
			| {
					data: {
						numberOfImages: number;
						numberOfUsers: number;
						userImages: number;
					};
					success: true;
			  }
			| { success: false }
		>,
	) => {
		setTimeout(() => {
			console.log("Mock: Get Summary", userId);
			callback({
				data: {
					numberOfImages: 10,
					numberOfUsers: 3,
					userImages: 2,
				},
				success: true,
			});
		}, 200);
	},
	createUser: (
		data: { studentNumber: string; nickname: string },
		callback: SuccessHandler<
			{ success: true; userId: string } | { success: false; message?: string }
		>,
	) => {
		setTimeout(() => {
			console.log("Mock: Create User", data);
			callback({ success: true, userId: "mock-user-id" });
		}, 200);
	},
	getUserData: (
		userId: string,
		callback: SuccessHandler<{
			userId: string;
			createdAt: string;
			images: string;
			ranking: string;
			studentNumber: string;
			nickname: string;
		} | null>,
	) => {
		setTimeout(() => {
			console.log("Mock: Get User Data", userId);
			callback({
				userId: userId,
				createdAt: new Date().toISOString(),
				images: "5",
				ranking: "1",
				studentNumber: "123456",
				nickname: "モック太郎",
			});
		}, 200);
	},
	getRanking: (
		callback: SuccessHandler<
			| {
					data: { userId: string; images: string; ranking: string }[];
					success: true;
			  }
			| { success: false }
		>,
	) => {
		setTimeout(() => {
			console.log("Mock: Get Ranking");
			callback({
				data: [
					{ userId: "mock-user-1", images: "10", ranking: "1" },
					{ userId: "mock-user-2", images: "9", ranking: "2" },
					{ userId: "mock-user-3", images: "8", ranking: "3" },
					{ userId: "mock-user-4", images: "7", ranking: "4" },
					{ userId: "mock-user-5", images: "6", ranking: "5" },
					{ userId: "mock-user-6", images: "5", ranking: "6" },
					{ userId: "mock-user-7", images: "4", ranking: "7" },
					{ userId: "mock-user-8", images: "3", ranking: "8" },
					{ userId: "mock-user-9", images: "2", ranking: "9" },
					{ userId: "mock-user-10", images: "1", ranking: "10" },
				],
				success: true,
			});
		}, 200);
	},
};

// mock window.google.script
export function setupMockGoogleScript(): void {
	if (!window.google)
		window.google = { script: { run: {} as GoogleAppsScriptRun } };
	if (!window.google.script)
		window.google.script = { run: {} as GoogleAppsScriptRun };
	window.google.script.run = (() => {
		let successHandler: ((result: unknown) => void) | null = null;
		let failureHandler: ((error: Error) => void) | null = null;
		const handler: ProxyHandler<object> = {
			get(_target: object, prop: string) {
				if (prop === "withSuccessHandler") {
					return (fn: (result: unknown) => void) => {
						successHandler = fn;
						return new Proxy({}, handler) as GoogleAppsScriptRun;
					};
				}
				if (prop === "withFailureHandler") {
					return (fn: (error: Error) => void) => {
						failureHandler = fn;
						return new Proxy({}, handler) as GoogleAppsScriptRun;
					};
				}
				if (
					typeof (mockFunctions as Record<string, unknown>)[prop] === "function"
				) {
					return (...args: unknown[]) => {
						try {
							(mockFunctions as Record<string, (...args: unknown[]) => void>)[
								prop
							]?.(...args, (result: unknown) => {
								if (successHandler) successHandler(result);
							});
						} catch (e) {
							if (failureHandler) failureHandler(e as Error);
						}
						return new Proxy({}, handler) as GoogleAppsScriptRun;
					};
				}
				return undefined;
			},
		};
		return new Proxy({}, handler) as GoogleAppsScriptRun;
	})();
}
