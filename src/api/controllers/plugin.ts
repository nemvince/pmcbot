import type { Request, Response } from 'express';
import { prisma } from '@/utils/prisma';
import { wss } from '@/wss';
// for random string generation
import { nanoid } from 'nanoid';
import { logger } from '..';

export const startAuthorization = async (req: Request, res: Response) => {
  const { mc_username, ip } = req.body;

  logger.log(`Received authorization request for ${mc_username} from ${ip}`);

  if (typeof mc_username !== 'string') {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { mc_username: mc_username as string }
  });

  if (!user) {
    wss.sendMessage(JSON.stringify({
      event: 'failedAuthorization',
      reason: 'Nincs összekötve a Discord fiókod a Minecraft fiókoddal!',
      mc_username
    }));
    return;
  }

  if (!user.allowed_login) {
    wss.sendMessage(JSON.stringify({
      event: 'failedAuthorization',
      reason: 'Nem engedélyezett a belépés!',
      mc_username
    }));
    return;
  }

  const existingAuthRequest = await prisma.authRequest.findFirst({
    where: { user_id: user.discord_id }
  });

  if (existingAuthRequest) {
    res.status(403).json({ error: 'An existing authorization request is already pending', code: existingAuthRequest.code });
    return;
  }

  const code = nanoid(6);

  await prisma.authRequest.create({
    data: {
      code,
      user_id: user.discord_id
    }
  });

  logger.log(`Created authorization request for ${mc_username} with code ${code}`);

  res.json({ code });
}