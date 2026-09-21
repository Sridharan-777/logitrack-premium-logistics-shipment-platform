import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if (existsSync('.env')) { console.log('.env already exists; it was not changed.'); }
else { writeFileSync('.env', `TRACKING_OPERATOR_KEY=${randomBytes(32).toString('hex')}\nPORT=3001\nTRACKING_DATA_DIR=data\n`, {mode:0o600}); console.log('Created ignored .env with a private operator key. Keep this file private.'); }
