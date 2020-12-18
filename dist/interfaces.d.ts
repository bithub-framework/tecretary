export * from 'interfaces';
import { Config as TexchangConfig } from 'texchange';
export { RawTrade } from 'texchange';
export interface Config extends TexchangConfig {
    DB_FILE_PATH: string;
}
