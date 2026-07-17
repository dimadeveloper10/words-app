import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enums/role.enum';
import { User } from '../../users/entities/user.entity';
import { dataSource } from '../data-source';

/**
 * Creates the first superadmin from SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD
 * if one does not already exist. Idempotent.
 */
async function seedSuperadmin(): Promise<void> {
  const email = process.env.SUPERADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set to seed a superadmin',
    );
  }

  await dataSource.initialize();

  try {
    const repo = dataSource.getRepository(User);

    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      console.log(`Superadmin "${email}" already exists — skipping.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = repo.create({
      email,
      passwordHash,
      role: Role.SUPERADMIN,
      name: 'Super Admin',
    });
    await repo.save(user);

    console.log(`Superadmin "${email}" created.`);
  } finally {
    await dataSource.destroy();
  }
}

seedSuperadmin().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
