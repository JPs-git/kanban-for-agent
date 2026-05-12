import Database from 'better-sqlite3';

function generateUUID(): string {
  const randomHex = (bytes: number): string => {
    const values = new Uint8Array(bytes);
    crypto.getRandomValues(values);
    return Array.from(values)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const timeLow = randomHex(4);
  const timeMid = randomHex(2);
  const timeHiAndVersion = (parseInt(randomHex(2), 16) & 0x0fff | 0x4000).toString(16).padStart(4, '0');
  const clockSeqHiAndReserved = (parseInt(randomHex(2), 16) & 0x3fff | 0x8000).toString(16).padStart(4, '0');
  const clockSeqLow = randomHex(2);
  const node = randomHex(6);

  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqHiAndReserved}-${clockSeqLow}${node}`;
}

export const up = (db: Database.Database): void => {
  const hasUuidColumn = db.prepare("PRAGMA table_info(users)").all()
    .some((col: any) => col.name === 'uuid');

  if (!hasUuidColumn) {
    db.exec(`ALTER TABLE users ADD COLUMN uuid TEXT UNIQUE`);
  }

  const usersWithoutUuid = db.prepare('SELECT id FROM users WHERE uuid IS NULL').all() as { id: number }[];

  if (usersWithoutUuid.length > 0) {
    console.log(`  Generating UUIDs for ${usersWithoutUuid.length} existing users...`);

    const updateStmt = db.prepare('UPDATE users SET uuid = ? WHERE id = ?');

    for (const user of usersWithoutUuid) {
      const uuid = generateUUID();
      updateStmt.run(uuid, user.id);
    }

    const missingUuids = db.prepare('SELECT COUNT(*) as count FROM users WHERE uuid IS NULL').get() as { count: number };
    if (missingUuids.count > 0) {
      throw new Error(`Failed to generate UUIDs for ${missingUuids.count} users`);
    }
  }

  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const usersWithUuid = db.prepare('SELECT COUNT(*) as count FROM users WHERE uuid IS NOT NULL').get() as { count: number };

  console.log(`  ✅ Users table migration complete: ${usersWithUuid.count}/${totalUsers.count} users have UUIDs`);
};

export const down = (_db: Database.Database): void => {
  console.log('  ⚠️  Down migration not supported for UUID migration');
};
