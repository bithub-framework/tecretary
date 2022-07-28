export class TYPES {
	public static readonly config = Symbol('config');
	public static readonly progressReader = Symbol('progressReader');
	public static readonly startTime = Symbol('startTime');
	public static readonly progressFilePath = Symbol('progressFilePath');
	public static readonly dataReader = Symbol('dataReader');
	public static readonly dataFilePath = Symbol('dataFilePath');

	public static readonly texchangeMap = Symbol('texchangeMap');
	public static readonly timeline = Symbol('timeline');
	public static readonly endTime = Symbol('endTime');
	public static readonly context = Symbol('context');

	public static readonly Strategy = Symbol('strategyStatic');
	public static readonly strategy = Symbol('strategy');

	public static readonly hFactory = Symbol('hFactory');
	public static readonly hStatic = Symbol('hStatic');
	public static readonly tecretary = Symbol('tecretary');
}
