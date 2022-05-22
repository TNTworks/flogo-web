import { config } from '../../config/app-config';
import { Database } from '../database.service';
import { logger } from '../logging';

logger.info(`Starting indexer DB at ${config.indexer.dbPath}`);
const db = new Database({ filename: config.indexer.dbPath, autoload: true });
export { db as indexer };
