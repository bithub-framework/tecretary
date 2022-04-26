export interface Callback {
	(): void;
}

export interface CheckPoint {
	time: number;
	cb: () => void;
}

export interface TimeEngineLike extends Iterator<Callback> {
	setTimeout(checkPoint: CheckPoint): TimeoutLike;
}

export interface TimeoutLike {
	clear(): void;
}
