import { HLike } from 'interfaces';
export interface Config<H extends HLike<H>> {
    DB_FILE_PATH: string;
    projectId: string;
    startTime: number;
    markets: string[];
}
