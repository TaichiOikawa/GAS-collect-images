/**
 * GAS の Sheetクラスのラッパ
 *
 * @class Sheet
 */
export class Sheet {
	public source: GoogleAppsScript.Spreadsheet.Sheet;
	public lRow: number;
	public lCol: number;
	private _hI: number = 1;
	public dict: Record<string, number> = {};
	public all: Array<Record<string, unknown>> = [];

	/**
	 * Sheetクラスのインスタンスを生成する。
	 * @param source GAS の Sheetクラスのインスタンス
	 * @param hI ヘッダ行の行数
	 */
	constructor(source: GoogleAppsScript.Spreadsheet.Sheet, hI: number = 1) {
		this.source = source;
		this.lRow = source.getLastRow();
		this.lCol = source.getLastColumn();
		this.hI = hI;
		this.findAll();
	}

	set hI(num: number) {
		this._hI = num;
		this.dict = this.genDict();
	}

	get hI(): number {
		return this._hI;
	}

	/**
	 * シートのカラム名が何列目に存在するのかをもつ「ディクショナリ」を生成する。
	 */
	genDict(): Record<string, number> {
		const map: Record<string, number> = {};
		if (this.lCol > 0) {
			this.source
				.getRange(this.hI, 1, 1, this.lCol)
				.getValues()[0]
				.forEach((key: string, idx: number) => {
					map[key] = idx + 1;
				});
		}
		return map;
	}

	/**
	 * シート内にあるデータを全て取得する。
	 */
	findAll(): Array<Record<string, unknown>> {
		if (this.lRow - this.hI > 0) {
			this.all = this.source
				.getRange(this.hI + 1, 1, this.lRow - this.hI, this.lCol)
				.getValues()
				.map((row: unknown[], i: number) => {
					const datum: Record<string, unknown> = {};
					datum.rI = i + this.hI + 1;
					Object.keys(this.dict).forEach((key) => {
						datum[key] = row[this.dict[key] - 1];
					});
					return datum;
				});
		} else {
			this.all = [];
		}
		return this.all;
	}

	/**
	 * シート内のデータを条件付きで取得する。
	 */
	find(
		conditions: Record<string, unknown> = {},
	): Array<Record<string, unknown>> {
		let result = this.all;
		for (const k of Object.keys(conditions)) {
			result = result.filter((o) => o[k] === conditions[k]);
		}
		return result;
	}

	/**
	 * シート内のデータを条件付きで取得する（1件のみ）。
	 */
	pick(
		conditions: Record<string, unknown> = {},
		index: number = 0,
	): Record<string, unknown> | undefined {
		return this.find(conditions)[index];
	}

	/**
	 * シート内に新たにデータを挿入する。
	 */
	insert(data: Record<string, unknown> | Array<Record<string, unknown>>): void {
		if (Array.isArray(data)) {
			const l = data.length;
			const r = this.source.getRange(this.lRow + 1, 1, l, this.lCol);
			const v = r.getValues();
			data.forEach((datum, i) => {
				Object.keys(datum).forEach((k) => {
					v[i][this.dict[k] - 1] = datum[k];
				});
			});
			r.setValues(v);
		} else {
			const r = this.source.getRange(this.lRow + 1, 1, 1, this.lCol);
			const v = r.getValues();
			Object.keys(data).forEach((k) => {
				v[0][this.dict[k] - 1] = data[k];
			});
			r.setValues(v);
		}
		this.lRow = this.source.getLastRow();
	}

	/**
	 * シート内の条件にあう既存のデータを上書きする。
	 */
	update(
		data: Record<string, unknown>,
		conditions: Record<string, unknown>,
	): boolean {
		let updated = false;
		if (conditions) {
			this.findAll()
				.filter((o) => {
					return Object.keys(conditions).every((k) => o[k] === conditions[k]);
				})
				.forEach((x) => {
					const r = this.source.getRange(Number(x.rI), 1, 1, this.lCol);
					const v = r.getValues();
					Object.keys(data).forEach((k) => {
						v[0][this.dict[k] - 1] = data[k];
					});
					r.setValues(v);
					updated = true;
				});
		}
		return updated;
	}

	upsert(
		data: Record<string, unknown>,
		conditions: Record<string, unknown>,
	): void {
		if (this.find(conditions).length > 0) {
			this.update(data, conditions);
		} else {
			this.insert(data);
		}
	}

	refreshFormula(): void {
		this.source
			.getRange(this.hI, 1, 1, this.lCol)
			.getFormulas()[0]
			.forEach((c: string, i: number) => {
				Logger.log(c);
				if (c.indexOf("ARRAYFORMULA") !== -1) {
					Logger.log(`MATCHED : ${i + 1}`);
					this.source
						.getRange(this.hI + 1, i + 1, this.lRow - this.hI, 1)
						.clear();
				}
			});
	}

	clear(): void {
		if (this.lRow - this.hI > 0) {
			this.source
				.getRange(this.hI + 1, 1, this.lRow - this.hI, this.lCol)
				.clear({ contentsOnly: true });
		}
		this.lRow = this.source.getLastRow();
	}

	/**
	 * 条件に合う行をすべて削除するメソッド
	 */
	delete(conditions: Record<string, unknown> = {}): void {
		const matched = this.find(conditions);
		matched
			.sort((a, b) => Number(b.rI) - Number(a.rI))
			.forEach((datum) => {
				this.source.deleteRow(Number(datum.rI));
			});
		this.lRow = this.source.getLastRow();
		this.findAll();
	}
}

/**
 * GASのオブジェクトである Spreadsheet クラス を JSで扱いやすようにするラッパークラス
 *
 * @class Spreadsheet
 */
export class Spreadsheet {
	public source: GoogleAppsScript.Spreadsheet.Spreadsheet;

	constructor() {
		this.source = SpreadsheetApp.getActiveSpreadsheet();
	}

	/**
	 * シート名から、その名前をもつシートを得る関数です。
	 */
	at(name: string, hI: number = 1): Sheet {
		const sheetSource = this.source.getSheetByName(name);
		if (!sheetSource) {
			throw new Error(`Sheet not found: ${name}`);
		}
		return new Sheet(sheetSource, hI);
	}

	/**
	 * シート名でシートを作成または取得する。
	 */
	createOrFindSheet(name: string, hI: number = 1): Sheet {
		let sheetSource: GoogleAppsScript.Spreadsheet.Sheet;
		try {
			sheetSource = this.at(name).source;
		} catch {
			sheetSource = this.source.insertSheet(name);
		}
		return new Sheet(sheetSource, hI);
	}

	from(spreadsheetID?: string): this {
		if (spreadsheetID) {
			this.source = SpreadsheetApp.openById(spreadsheetID);
		} else {
			this.source = SpreadsheetApp.getActiveSpreadsheet();
		}
		return this;
	}
}
