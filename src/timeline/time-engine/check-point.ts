export interface CheckPoint {
	time: number;
	cb: () => void;
}
