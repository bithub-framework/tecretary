import { Snapshot } from 'texchange';
import { StartableLike } from 'startable';
import { Texchange } from 'texchange';
import { HLike } from 'secretary-like';
export interface ProgressReaderLike<H extends HLike<H>> extends StartableLike {
    capture(time: number, texchangeMap: Map<string, Texchange<H>>): void;
    getTime(): number;
    getSnapshot(marketName: string): Snapshot | null;
    log(content: string, time: number): void;
}
